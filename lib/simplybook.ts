// lib/simplybook.ts

const BASE_URL = "https://user-api.simplybook.me";

export interface SimplyBookCreds {
    companyLogin: string;
    apiKey: string;
}

export interface ClientData {
    name: string;
    phone: string;
    email?: string;
}

// Internal Generic RPC Caller
async function jsonRpcRequest(
    method: string,
    params: any[] = [],
    creds?: { login: string; token: string }
) {
    const headers: any = { "Content-Type": "application/json" };
    if (creds) {
        headers["X-Company-Login"] = creds.login;
        headers["X-Token"] = creds.token;
    }
    const url = method === "getToken" ? `${BASE_URL}/login` : BASE_URL;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ jsonrpc: "2.0", method: method, params: params, id: 1 }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "Unknown API Error");
        return data.result;
    } catch (error) {
        console.error(`SimplyBook Error [${method}]:`, error);
        return null; // Fail gracefully
    }
}

// 1. Auth
export async function getToken(creds: SimplyBookCreds): Promise<string | null> {
    return await jsonRpcRequest("getToken", [creds.companyLogin, creds.apiKey]);
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
    
    const requestCreds = { login: creds.companyLogin, token };
    
    let resolvedServiceId = serviceId;
    if (!resolvedServiceId) {
        // Fallback: Grab the first available service if none specified
        const servicesMap = await jsonRpcRequest("getEventList", [], requestCreds);
        const services = Object.values(servicesMap || {});
        if (services.length === 0) return null;
        resolvedServiceId = (services[0] as any).id;
    }

    const timeMatrix = await jsonRpcRequest(
        "getStartTimeMatrix",
        [fromDate, toDate, resolvedServiceId, providerId],
        requestCreds
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

    const requestCreds = { login: creds.companyLogin, token };

    let resolvedServiceId = serviceId;
    if (!resolvedServiceId) {
        const servicesMap = await jsonRpcRequest("getEventList", [], requestCreds);
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
            null,
            null
        ],
        requestCreds
    );

    return bookingResult; // E.g., returns the unique booking ID
}
