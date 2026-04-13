const fs = require('fs');
const filePath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

let newLines = [];
let currentLineBuffer = "";

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this looks like a new entry
    const isNewEntry = line.startsWith('US-') || line.startsWith('ID;') || line.match(/^[A-Z][0-9]+;/);

    if (isNewEntry) {
        if (currentLineBuffer) {
            newLines.push(currentLineBuffer);
        }
        currentLineBuffer = line;
    } else {
        if (currentLineBuffer) {
            currentLineBuffer += " " + line;
        } else {
            // First line or unexpected text
            currentLineBuffer = line;
        }
    }
}

if (currentLineBuffer) {
    newLines.push(currentLineBuffer);
}

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Fixed Userstories.csv with final aggressive logic');
