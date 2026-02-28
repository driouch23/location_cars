const https = require('https');
const fs = require('fs');
const path = require('path');

const query = `
[out:json][timeout:25];
// fetch area "Morocco" to search
area["name:en"="Morocco"]->.searchArea;
// gather results
(
  // query part for: “amenity=car_rental”
  node["amenity"="car_rental"](area.searchArea);
  way["amenity"="car_rental"](area.searchArea);
  relation["amenity"="car_rental"](area.searchArea);
);
// print results
out center;
`;

const options = {
    hostname: 'overpass-api.de',
    path: '/api/interpreter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

console.log("Fetching car rental agencies in Morocco from OpenStreetMap...");

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const elements = json.elements;
            console.log(`Found ${elements.length} agencies.`);
            const agencies = elements.map((el, i) => {
                const lat = el.lat || (el.center && el.center.lat);
                const lon = el.lon || (el.center && el.center.lon);
                // Try to get a decent name, fallback to "Car Rental" + id
                let name = el.tags && el.tags.name ? el.tags.name : `Rental Agency #${i + 1}`;
                if (el.tags && el.tags.brand && !el.tags.name) {
                    name = el.tags.brand;
                }

                let phone = '';
                if (el.tags && (el.tags.phone || el.tags['contact:phone'])) {
                    phone = el.tags.phone || el.tags['contact:phone'];
                }

                let city = 'Morocco';
                if (el.tags && el.tags['addr:city']) {
                    city = el.tags['addr:city'];
                }

                let address = '';
                if (el.tags && el.tags['addr:street']) {
                    address = el.tags['addr:street'];
                    if (el.tags['addr:housenumber']) {
                        address = el.tags['addr:housenumber'] + ' ' + address;
                    }
                }

                return {
                    id: `osm-${el.id}`,
                    name,
                    lat,
                    lng: lon,
                    phone: phone || undefined,
                    city: city,
                    address: address || "Address unavailable"
                };
            }).filter(a => a.lat && a.lng);

            const fileContent = `import { DirectoryAgency } from "@/components/dashboard/directory-map-view"\n\nexport const realAgenciesData = ${JSON.stringify(agencies, null, 2)} as any[];`;
            const destPath = path.join(__dirname, 'lib', 'osm-agencies.ts');
            fs.writeFileSync(destPath, fileContent);
            console.log("Saved to lib/osm-agencies.ts!");
        } catch (e) {
            console.error("Failed to parse OSM data:", e);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(`data=${encodeURIComponent(query)}`);
req.end();
