import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const url = "http://localhost:3000/api/mapbox/route";
    const requestBody = { 
      originLat: 28.5561437, 
      originLng: 77.0999623, 
      destLat: 28.5834828, 
      destLng: 77.211126 
    };
    
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
