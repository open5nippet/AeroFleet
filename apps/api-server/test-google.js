import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY;
console.log("Key:", GOOGLE_MAPS_KEY);

async function run() {
    const url = "https://places.googleapis.com/v1/places:searchText";
    const requestBody = { textQuery: "Airport", regionCode: "IN" };
    
    try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_KEY,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location"
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log("Status:", response.status);
        const data = await response.text();
        console.log("Data:", data);
    } catch(e) {
        console.error(e);
    }
}
run();
