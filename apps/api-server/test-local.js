import fs from 'fs';

async function run() {
    const url = "http://localhost:3000/api/mapbox/geocode";
    const requestBody = { query: "Airport", country: "IN" };
    
    try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log("Status:", response.status);
        const data = await response.text();
        console.log("Data:", data);
    } catch(e) {
        console.error("Fetch failed:", e.message);
    }
}
run();
