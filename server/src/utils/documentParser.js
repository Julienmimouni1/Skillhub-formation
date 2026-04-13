const fs = require('fs');
const path = require('path');
// pdf-parse causes issues on Vercel because of missing DOMMatrix/Canvas
let pdf = null;
if (process.env.NODE_ENV !== 'production') {
    try {
        pdf = require('pdf-parse');
    } catch (e) {
        console.warn('pdf-parse could not be loaded');
    }
}
const mammoth = require('mammoth');

const extractText = async (filePath) => {
    // On Vercel, file system is read-only and pdf-parse is broken
    if (process.env.NODE_ENV === 'production') {
        return "Analyse de document désactivée en production (Vercel).";
    }

    const ext = path.extname(filePath).toLowerCase();

    try {
        if (ext === '.pdf' && pdf) {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        } else if (ext === '.txt') {
            return fs.readFileSync(filePath, 'utf8');
        }
    } catch (error) {
        console.error(`Error parsing file ${filePath}:`, error);
        return "";
    }
    return "";
};

const extractActionsFromText = (text) => {
    if (!text) return [];

    const lines = text.split('\n');
    const actions = [];

    // Heuristic: Look for bullet points or imperative verbs
    const actionVerbs = [
        'faire', 'créer', 'définir', 'organiser', 'planifier', 'rédiger', 'analyser',
        'mettre', 'appliquer', 'vérifier', 'tester', 'déployer', 'configurer', 'suivre',
        'contacter', 'envoyer', 'préparer', 'lancer', 'optimiser', 'structurer'
    ];

    const bulletRegex = /^[\s-•*]+/;

    for (let line of lines) {
        line = line.trim();
        if (line.length < 10 || line.length > 150) continue; // Filter too short/long lines

        let isAction = false;

        // Check 1: Bullet points
        if (bulletRegex.test(line)) {
            // Remove bullet
            const cleanLine = line.replace(bulletRegex, '').trim();
            // Check if starts with verb or is significant
            if (cleanLine.length > 10) {
                actions.push(cleanLine);
            }
        }
    }

    // Limit to top 5 actions
    return actions.slice(0, 5);
};

module.exports = { extractText, extractActionsFromText };
