import fs from 'fs';

function searchPhrase(dir, phrase) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = dir + '/' + file;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchPhrase(fullPath, phrase);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.py') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(phrase.toLowerCase())) {
        console.log(`Found "${phrase}" in: ${fullPath}`);
      }
    }
  }
}

searchPhrase('src', 'scheme not found');
searchPhrase('backend', 'scheme not found');
