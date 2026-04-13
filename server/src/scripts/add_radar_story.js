const fs = require('fs');
const filePath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';

const newStory = 'US-706;Manager;Comparer les profils (Radar);Comparer un collaborateur avec la moyenne équipe ou un autre profil;GPEC;DONE';

fs.appendFileSync(filePath, '\n' + newStory, 'utf8');
console.log('Added Radar Comparison user story to Userstories.csv');
