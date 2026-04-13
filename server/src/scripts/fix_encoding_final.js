const fs = require('fs');
const path = require('path');

const inputPath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories_temp.txt';
const outputPath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';

const buffer = fs.readFileSync(inputPath);
let content = buffer.toString('binary');

function fixEncoding(text) {
    return text
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

try {
    const rawBuffer = Buffer.from(content, 'binary');
    const decoded = rawBuffer.toString('utf8');

    if (decoded.includes('é') && !decoded.includes('Ã©')) {
        const cleanLines = decoded.split('\n').filter(line => !line.trim().startsWith('E n    t a n t'));
        fs.writeFileSync(outputPath, cleanLines.join('\n'), 'utf8');
        console.log('Fixed Userstories.csv using UTF-8 decode.');
    } else {
        const fixed = fixEncoding(content);
        const cleanLines = fixed.split('\n').filter(line => !line.trim().startsWith('E n    t a n t'));
        fs.writeFileSync(outputPath, cleanLines.join('\n'), 'utf8');
        console.log('Fixed Userstories.csv with manual replacements.');
    }
} catch (e) {
    console.error('Error decoding:', e);
    const fixed = fixEncoding(content);
    fs.writeFileSync(outputPath, fixed, 'utf8');
    console.log('Fixed Userstories.csv with fallback.');
}
