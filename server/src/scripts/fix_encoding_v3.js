const fs = require('fs');

const inputPath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';

// 1. Read as UTF-8 (gets Ã©)
const content = fs.readFileSync(inputPath, 'utf8');

// 2. Convert to binary buffer (Ã -> 0xC3, © -> 0xA9)
// If there are chars > 255 which are not latin1, they might be lost, but for French text it's usually fine.
// But some chars like Œ (U+0152) are not in latin1 (U+0000 to U+00FF).
// Windows-1252 has Œ at 0x8C.
// If the file was interpreted as Windows-1252, then Œ would be read as...
// Let's assume standard latin1 for now as 'Ã©' -> 'é' is the main issue.

const rawerBuffer = Buffer.from(content, 'binary');

// 3. Interpret as UTF-8
const decoded = rawerBuffer.toString('utf8');

// 4. Clean up weird lines
const lines = decoded.split('\n');
const cleanLines = lines.filter(line => !line.trim().startsWith('E n    t a n t'));

fs.writeFileSync(inputPath, cleanLines.join('\n'), 'utf8');
console.log('Fixed Userstories.csv using binary buffer trick.');
