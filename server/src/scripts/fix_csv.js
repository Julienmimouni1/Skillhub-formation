const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

let newLines = [];
let i = 0;

while (i < lines.length) {
    let line = lines[i].trim();

    // If we are in the bugged range (roughly lines 193 to 371 originally)
    // Actually, it's easier to detect if a line starts with "US-" or is empty.
    // If it's a single word or short text not starting with US-, it might be a broken part.

    if (i >= 190 && i <= 400) { // Safety margin
        if (line && !line.startsWith('US-') && !line.includes(';')) {
            // This is likely a broken word. Append it to the previous non-empty line if possible,
            // or collect it until we find a full line.

            // Actually, looking at the pattern, it seems some US were written vertically.
            // Example:
            // tant
            // que
            // visiteur

            let sentence = [];
            while (i < lines.length && line && !line.startsWith('US-') && line !== 'DONE') {
                sentence.push(lines[i].trim());
                i++;
                if (i < lines.length) line = lines[i].trim();
            }

            if (sentence.length > 0) {
                let joined = sentence.join(' ');
                // Find previous US line to append to, or just add as a note if it's "DONE"
                if (newLines.length > 0 && !newLines[newLines.length - 1].endsWith('DONE')) {
                    newLines[newLines.length - 1] += ' ' + joined;
                } else {
                    newLines.push(joined);
                }
            }
            continue;
        }
    }

    newLines.push(lines[i]);
    i++;
}

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Fixed Userstories.csv');
