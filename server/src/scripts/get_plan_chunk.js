const fs = require('fs');
const path = require('path');
const planPath = path.join(__dirname, 'sync_plan.json');

const args = process.argv.slice(2);
const start = parseInt(args[0], 10) || 0;
const count = parseInt(args[1], 10) || 10;

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const chunk = plan.slice(start, start + count);

console.log(JSON.stringify(chunk, null, 2));
