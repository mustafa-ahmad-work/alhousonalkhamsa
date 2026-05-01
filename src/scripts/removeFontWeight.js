const fs = require('fs');
const path = require('path');

const dirs = [
  'c:\\projects\\my-app\\src\\components',
  'c:\\projects\\my-app\\src\\screens'
];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = dirs.flatMap(walk);
console.log(`Found ${files.length} files to process.`);

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;

    // Remove fontWeight properties
    // 1. Property with trailing comma (handles fontWeight: "bold",)
    newContent = newContent.replace(/\s*fontWeight\s*:\s*[^,}\n]+,/g, '');
    
    // 2. Property with leading comma (handles , fontWeight: "bold")
    newContent = newContent.replace(/,\s*fontWeight\s*:\s*[^,}\n]+/g, '');
    
    // 3. Standalone property (handles fontWeight: "bold")
    newContent = newContent.replace(/\s*fontWeight\s*:\s*[^,}\n]+/g, '');

    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Updated: ${file}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
  }
});

console.log('Done!');
