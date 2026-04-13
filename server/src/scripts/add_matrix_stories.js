const fs = require('fs');
const filePath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';

const newStories = [
    'US-704;Manager;Personnaliser le référentiel de compétences;Le manager peut ajouter ou renommer des compétences pour son scope;Référentiel agile;DONE',
    'US-705;Manager;Analyser les écarts de compétences;Visualisation claire des gaps et opportunités (Power-Ups);Pilotage GPEC;DONE'
];

fs.appendFileSync(filePath, '\n' + newStories.join('\n'), 'utf8');
console.log('Added Matrix user stories to Userstories.csv');
