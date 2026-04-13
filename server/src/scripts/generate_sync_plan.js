const fs = require('fs');
const path = require('path');

const csvPath = path.join('C:/Users/julie/OneDrive/Desktop/Skillhub-Formation/Skillshub-KB/02_FONCTIONNEL/Userstories.csv');
const knownPath = path.join(__dirname, 'notion_known_ids.json');
const outPath = path.join(__dirname, 'sync_plan.json');

const csvContent = fs.readFileSync(csvPath, 'utf8');
let known = [];
try {
    known = JSON.parse(fs.readFileSync(knownPath, 'utf8'));
} catch (e) {
    console.log("No known IDs found, proceeding with creates.");
}

const knownMap = new Map(known.map(k => [k.content, k.id]));

// Simple CSV parser handling quotes
function parseCSV(text) {
    const rows = [];
    let row = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ';' && !inQuote) {
            row.push(current.trim());
            current = '';
        } else if (char === '\n' && !inQuote) {
            row.push(current.trim());
            rows.push(row);
            row = [];
            current = '';
        } else if (char === '\r') {
            // ignore
        } else {
            current += char;
        }
    }
    if (current) row.push(current.trim());
    if (row.length > 0) rows.push(row);
    return rows;
}

const rows = parseCSV(csvContent);
const header = rows[0]; // ID;Role;Action;Benefice;Criteres_Acceptation
// Index map
const idx = {
    ID: 0,
    Role: 1,
    Action: 2,
    Benefice: 3,
    Criteres: 4
};

const plan = [];

// Start from 1 to skip header
for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 5) continue;

    const usId = row[idx.ID];
    if (!usId) continue;

    const properties = {
        ID: { title: [{ text: { content: usId } }] },
        Role: { rich_text: [{ text: { content: row[idx.Role] || "" } }] },
        Action: { rich_text: [{ text: { content: row[idx.Action] || "" } }] },
        Benefice: { rich_text: [{ text: { content: row[idx.Benefice] || "" } }] },
        Criteres_Acceptation: { rich_text: [{ text: { content: row[idx.Criteres] || "" } }] }
    };

    if (knownMap.has(usId)) {
        plan.push({
            action: 'update',
            page_id: knownMap.get(usId),
            properties: properties
        });
    } else {
        plan.push({
            action: 'create',
            database_id: '2b201e14-8ca3-804b-a2f8-f038b34b8fe6',
            properties: properties
        });
    }
}

fs.writeFileSync(outPath, JSON.stringify(plan, null, 2));
console.log(`Generated plan with ${plan.length} items.`);
