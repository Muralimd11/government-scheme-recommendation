import fs from 'fs';

function searchButtons(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = dir + '/' + file;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchButtons(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (/submit.*online|online.*application|submit.*application/i.test(l)) {
          console.log(`${fullPath}:${idx + 1}: ${l.trim()}`);
        }
      });
    }
  }
}

searchButtons('src');
