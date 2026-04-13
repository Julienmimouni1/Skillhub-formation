const fs = require('fs');
const path = require('path');

const newIds = [
    { "id": "2b201e14-8ca3-8036-950a-c17d70ac4836", "content": "US-504" },
    { "id": "2b201e14-8ca3-8038-a220-db5f322ce549", "content": "US-407" },
    { "id": "2b201e14-8ca3-805b-8c7a-eb7de121080a", "content": "US-507" },
    { "id": "2b201e14-8ca3-805c-978f-fc2cf4a221d0", "content": "US-403" },
    { "id": "2b201e14-8ca3-8067-96a2-dea1ed986ab5", "content": "US-309" }
];

const filePath = path.join(__dirname, 'notion_known_ids.json');
let existing = [];
try {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
} catch (e) { }

const combined = [...existing, ...newIds];
fs.writeFileSync(filePath, JSON.stringify(combined, null, 2));
console.log('Appended ' + newIds.length + ' IDs.');
