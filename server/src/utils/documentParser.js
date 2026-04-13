const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const extractText = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();

    try {
        if (ext === '.pdf') {
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
                // Simple cleanup
                actions.push(cleanLine);
                isAction = true;
            }
        }

        // Check 2: Starts with action verb (if not already added)
        if (!isAction) {
            const firstWord = line.split(' ')[0].toLowerCase();
            if (actionVerbs.some(v => firstWord.startsWith(v))) {
                actions.push(line);
            }
        }
    }

    // Deduplicate and limit
    return [...new Set(actions)].slice(0, 10);
};

module.exports = { extractText, extractActionsFromText };
