const fs = require('fs');
const filePath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

let newLines = [];
let currentUS = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('US-')) {
        newLines.push(line);
        currentUS = newLines.length - 1;
    } else if (currentUS !== null) {
        // Append to the current US line
        newLines[currentUS] += ' ' + line;

        // If the added part ends with DONE, we might be finishing this US
        // or just keep appending until next US-
    } else {
        // If we haven't found a US- yet, just add it (header probably)
        newLines.push(line);
    }
}

// Post-process to ensure each US- line has correct semicolon count if needed,
// but for now let's just join the text.
// Actually, some lines might have been split mid-word or mid-sentence.

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Fixed Userstories.csv with improved logic');
