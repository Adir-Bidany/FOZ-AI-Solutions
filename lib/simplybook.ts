// lib/simplybook.ts

const BASE_URL = "https://user-api.simplybook.me";

export interface SimplyBookCreds {
    companyLogin: string;
    apiKey: string;
}

export interface SimplyBookAdminCreds {
    companyLogin: string;
    userLogin: string;
    userPassword?: string;
}

export interface ClientData {
    name: string;
    phone: string;
    email?: string;
    note?: string;
}

// Internal Generic RPC Caller
async function jsonRpcRequest(
    method: string,
    params: any[] = [],
    customHeaders?: Record<string, string>
) {
    let url = BASE_URL;
    if (method === "getToken") url = `${BASE_URL}/login`;
    if (method === "getUserToken") url = `${BASE_URL}/login`;
    if (method === "getBookings") url = `${BASE_URL}/admin`;

    const headers: any = { 
        "Content-Type": "application/json",
        ...customHeaders
    };
    try {
        console.log(`[SimplyBook Payload -> ${method}]:`, JSON.stringify(params, null, 2));
        
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ jsonrpc: "2.0", method: method, params: params, id: 1 }),
        });
        
        if (!response.ok) {
            console.error(`[SimplyBook HTTP Error ${response.status}]:`, await response.text());
            return null;
        }
        
        const data = await response.json();
        
        console.log(`[SimplyBook Response -> ${method}]:`, JSON.stringify(data, null, 2));

        if (data.error) {
            console.error(`[SimplyBook API Error - ${method}]:`, data.error);
            return null; // Fail gracefully
        }
        return data.result;
    } catch (err) {
        console.error(`[SimplyBook Network Fetch Error - ${method}]:`, err);
        return null; // Fail gracefully
    }
}

// 1. Auth
export async function getToken(creds: SimplyBookCreds): Promise<string | null> {
    return await jsonRpcRequest("getToken", [creds.companyLogin, creds.apiKey]);
}

export async function getUserToken(creds: SimplyBookAdminCreds): Promise<string | null> {
    return await jsonRpcRequest("getUserToken", [creds.companyLogin, creds.userLogin, creds.userPassword]);
}

// 2. Fetch Availability Matrix
export async function getAvailableSlots(
    creds: SimplyBookCreds,
    fromDate: string, // YYYY-MM-DD
    toDate: string,   // YYYY-MM-DD
    serviceId?: string,
    providerId: string = "any"
) {
    const token = await getToken(creds);
    if (!token) return null;
    
    const customHeaders = { 
        "X-Company-Login": creds.companyLogin, 
        "X-Token": token 
    };
    
    let resolvedServiceId = serviceId;
    if (!resolvedServiceId) {
        // Fallback: Grab the first available service if none specified
        const servicesMap = await jsonRpcRequest("getEventList", [], customHeaders);
        const services = Object.values(servicesMap || {});
        if (services.length === 0) return null;
        resolvedServiceId = (services[0] as any).id;
    }

    const timeMatrix = await jsonRpcRequest(
        "getStartTimeMatrix",
        [fromDate, toDate, resolvedServiceId, providerId],
        customHeaders
    );

    // Return the raw matrix object rather than formatting a string
    return timeMatrix; 
}

// 3. Execute Booking
export async function bookAppointment(
    creds: SimplyBookCreds,
    date: string,      // YYYY-MM-DD
    time: string,      // HH:MM
    clientData: ClientData,
    serviceId?: string,
    providerId: string = "any"
) {
    const token = await getToken(creds);
    if (!token) throw new Error("SimplyBook Authentication failed");

    const customHeaders = { 
        "X-Company-Login": creds.companyLogin, 
        "X-Token": token 
    };

    let resolvedServiceId = serviceId;
    if (!resolvedServiceId) {
        const servicesMap = await jsonRpcRequest("getEventList", [], customHeaders);
        const services = Object.values(servicesMap || {});
        if (services.length === 0) throw new Error("No services available to book");
        resolvedServiceId = (services[0] as any).id;
    }

    const bookingResult = await jsonRpcRequest(
        "book",
        [
            resolvedServiceId,
            providerId,
            date,
            time,
            { name: clientData.name, phone: clientData.phone, email: clientData.email || "no-reply@domain.com" },
            clientData.note ? { additional_info: clientData.note, remark: clientData.note } : null,
            null
        ],
        customHeaders
    );

    return bookingResult; // E.g., returns the unique booking ID
}

// 4. Fetch Bookings
export async function getBookings(
    creds: SimplyBookAdminCreds,
    fromDate: string, // YYYY-MM-DD
    toDate: string    // YYYY-MM-DD
) {
    const token = await getUserToken(creds);
    if (!token) return null; // Return null instead of [] on failure to trigger UI error state

    const customHeaders = { 
        "X-Company-Login": creds.companyLogin, 
        "X-User-Token": token // Many SimplyBook /admin endpoints strictly require X-User-Token instead of X-Token
    };

    const bookingsResponse = await jsonRpcRequest(
        "getBookings",
        [{ date_from: fromDate, date_to: toDate }],
        customHeaders
    );

    if (bookingsResponse === null) return null; // Pass error state to UI

    // Map the response to the required Event schema
    let rawBookings: any[] = [];
    if (bookingsResponse && typeof bookingsResponse === 'object' && !Array.isArray(bookingsResponse)) {
        rawBookings = Object.values(bookingsResponse);
    } else if (Array.isArray(bookingsResponse)) {
        rawBookings = bookingsResponse;
    }

    return rawBookings.map((booking: any) => {
        const startParts = booking.start_date ? booking.start_date.split(' ') : [];
        const endParts = booking.end_date ? booking.end_date.split(' ') : [];
        
        return {
            id: booking.id,
            title: booking.client_name || booking.client || booking.name || "לקוח",
            service: booking.service_title || booking.event || "פגישה",
            startTime: startParts[1] ? startParts[1].substring(0, 5) : "00:00",
            endTime: endParts[1] ? endParts[1].substring(0, 5) : "01:00",
            date: startParts[0] || "",
            phone: booking.client_phone || booking.phone || "",
            note: booking.additional_info || booking.remark || "",
        };
    });
}
