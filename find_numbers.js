import fs from 'fs';

const content = fs.readFileSync('src/pages/farmer/FarmerProfilePage.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Number(') || line.includes('type="number"')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
