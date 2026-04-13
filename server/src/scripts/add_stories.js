const fs = require('fs');
const filePath = 'c:\\Users\\julie\\OneDrive\\Desktop\\Skillhub-Formation\\Skillshub-KB\\02_FONCTIONNEL\\Userstories.csv';

const newStories = [
    'US-702;RH;Piloter les dossiers EADP;RH peut voir le dossier complet avec STAR stories et historiques;Dossier visible;DONE',
    'US-703;RH;Consulter l\'historique des formations;RH et Managers voient l\'historique filtrable et les stats ROI;Stats calculées;DONE'
];

fs.appendFileSync(filePath, '\n' + newStories.join('\n'), 'utf8');
console.log('Added new user stories to Userstories.csv');
