// תדביק כאן את המפתח שלך בתוך המרכאות
const apiKey = "AIzaSyDHCOy_6QhRQNo9logS854szfFoKKYkRS8";

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Checking available models...");

fetch(url)
    .then((response) => response.json())
    .then((data) => {
        if (data.error) {
            console.error("❌ Error:", data.error.message);
        } else if (data.models) {
            console.log("✅ Success! Here are your available models:");
            data.models.forEach((m) => {
                // מסנן רק מודלים שיודעים לייצר טקסט
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`👉 ${m.name.replace("models/", "")}`);
                }
            });
        } else {
            console.log("⚠️ No models found. Response:", data);
        }
    })
    .catch((err) => console.error("❌ Network Error:", err));
