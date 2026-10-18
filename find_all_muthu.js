import fs from 'fs';

function searchTerms(dir, terms) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = dir + '/' + file;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        searchTerms(fullPath, terms);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html') || file.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const t of terms) {
        if (content.toLowerCase().includes(t.toLowerCase())) {
          console.log(`Matched "${t}" in: ${fullPath}`);
        }
      }
    }
  }
}

searchTerms('src', ['muthu', 'muthuvel']);
searchTerms('backend', ['muthu', 'muthuvel']);
