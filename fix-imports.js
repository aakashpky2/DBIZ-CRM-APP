const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'backend'));

for (const file of files) {
  if (file.includes('backend\\config\\supabase.js')) continue;

  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Determine relative path to backend/config/supabase.js
  const fileDir = path.dirname(file);
  const configDir = path.join(__dirname, 'backend', 'config');
  let relativePath = path.relative(fileDir, configDir).replace(/\\/g, '/');
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  const importPath = relativePath + '/supabase';

  // Replace import
  const requireRegex = /const\s+(?:supabase|supabaseAdmin|\{\s*supabase\s*,\s*supabaseAdmin\s*\})\s*=\s*require\(['"]([^'"]*config\/supabase(?:Admin)?)['"]\);/g;
  
  if (requireRegex.test(content)) {
    content = content.replace(requireRegex, `const { supabase, supabaseAdmin } = require('${importPath}');`);
  }

  // Replace supabase.supabaseAdmin with supabaseAdmin
  content = content.replace(/supabase\.supabaseAdmin/g, 'supabaseAdmin');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
}
