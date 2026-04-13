const fs = require('fs');
const path = require('path');

const inputPath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';

// Read as UTF-8
let content = fs.readFileSync(inputPath, 'utf8');

function fixEncoding(text) {
    return text
        // Fix double-encoded
        .replace(/Ãƒ©/g, 'é')
        .replace(/Ãƒ /g, 'à')
        .replace(/Ãƒ¨/g, 'è')
        .replace(/Ãƒª/g, 'ê')
        .replace(/Ãƒ´/g, 'ô')
        .replace(/Ãƒ»/g, 'û')
        .replace(/Ãƒ§/g, 'ç')
        .replace(/Ãƒ¹/g, 'ù')
        .replace(/Ãƒ«/g, 'ë')
        .replace(/Ãƒ¯/g, 'ï')
        .replace(/Ãƒ¢/g, 'â')
        .replace(/Ãƒ®/g, 'î')
        .replace(/Ãƒ/g, 'à') // catchall for Ã if it ends up alone

        // Fix single level
        .replace(/Ã©/g, 'é')
        .replace(/Ã /g, 'à')
        .replace(/Ã¨/g, 'è')
        .replace(/Ãª/g, 'ê')
        .replace(/Ã´/g, 'ô')
        .replace(/Ã§/g, 'ç')
        .replace(/Ã¹/g, 'ù')
        .replace(/Ã«/g, 'ë')
        .replace(/Ã¯/g, 'ï')
        .replace(/Ã¢/g, 'â')
        .replace(/Ã®/g, 'î')
        .replace(/Ã»/g, 'û')
        .replace(/Ã‰/g, 'É')
        .replace(/Â/g, '')
        .replace(/â€™/g, "'")
        .replace(/â€œ/g, '"')
        .replace(/â€ /g, '"')
        .replace(/â€“/g, '-');
}

const fixed = fixEncoding(content);

// Remove weird spaced line if present
const cleanLines = fixed.split('\n').filter(line => !line.trim().startsWith('E n    t a n t'));

fs.writeFileSync(inputPath, cleanLines.join('\n'), 'utf8');
console.log('Fixed Userstories.csv via simple replacement.');
