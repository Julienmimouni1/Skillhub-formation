const fs = require('fs');

const inputPath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories_temp.txt';
const outputPath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';

// Read as string
let content = fs.readFileSync(inputPath, 'utf8');

console.log('Original length:', content.length);

// Use a map for replacements to be systematic
const replacements = [
    { from: /Ã©/g, to: 'é' },
    { from: /Ã /g, to: 'à' }, // Ã + NBSP (if interpreted by some editors) or Ã + Space (A0)
    { from: /Ã¨/g, to: 'è' },
    { from: /Ãª/g, to: 'ê' },
    { from: /Ã´/g, to: 'ô' },
    { from: /Ã§/g, to: 'ç' },
    { from: /Ã¹/g, 'to': 'ù' },
    { from: /Ã«/g, 'to': 'ë' },
    { from: /Ã¯/g, 'to': 'ï' },
    { from: /Ã¢/g, 'to': 'â' },
    { from: /Ã®/g, 'to': 'î' },
    { from: /Ã»/g, 'to': 'û' },
    { from: /Ã‰/g, 'to': 'É' },
    // Handle the Non-Breaking Space explicitly if it appears as a separate char
    // \u00C3 (\u00A0) => à
    // But in regex /Ã / captures specific sequences.
    // Let's add explicit HEX based replacement for the space one if needed.
];

let fixed = content;
replacements.forEach(rep => {
    fixed = fixed.replace(rep.from, rep.to);
});

// Also fix standard quote issues if any
fixed = fixed.replace(/â€™/g, "'");

// Remove weird lines
const lines = fixed.split('\n');
const cleanLines = lines.filter(line => !line.trim().startsWith('E n    t a n t'));

fs.writeFileSync(outputPath, cleanLines.join('\n'), 'utf8');
console.log('Fixed Userstories.csv via v4 precise replacement.');
