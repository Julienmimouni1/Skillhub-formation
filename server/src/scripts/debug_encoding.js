const fs = require('fs');

const inputPath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';

const buffer = fs.readFileSync(inputPath);
// Print first 500 bytes in hex
console.log(buffer.slice(0, 500).toString('hex'));

// Also search for the sequence around "oubli"
const text = buffer.toString('binary');
const index = text.indexOf('oubli');
if (index !== -1) {
    const slice = buffer.slice(index, index + 20);
    console.log('Hex around "oubli":', slice.toString('hex'));
    console.log('Chars around "oubli":', slice.toString('binary'));
}
