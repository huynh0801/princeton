const fs = require('fs');
const path = require('path');

const filesToCheck = ['index.html', 'partner.html'];
let allPassed = true;

for (const htmlFile of filesToCheck) {
  if (!fs.existsSync(htmlFile)) continue;
  const html = fs.readFileSync(htmlFile, 'utf8');
  const regex = /(?:src|href)=["']([^"']+)["']/g;
  let match;
  const localFiles = new Set();

  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    if (!url.startsWith('http') && !url.startsWith('//') && !url.startsWith('#') && !url.startsWith('tel:') && !url.startsWith('mailto:')) {
      localFiles.add(url);
    }
  }

  console.log(`--- Checking local references in ${htmlFile} ---`);
  for (const file of localFiles) {
    const cleanUrl = file.split('?')[0].split('#')[0];
    if (!cleanUrl) continue;
    const decoded = decodeURIComponent(cleanUrl);
    const exists = fs.existsSync(decoded);
    console.log(`${exists ? '✅' : '❌'} ${decoded} (from ${file})`);
    if (!exists) allPassed = false;
  }
}

if (allPassed) {
  console.log('\n🎉 ALL LOCAL RESOURCES VERIFIED SUCCESSFULLY!');
} else {
  console.error('\n⚠️ SOME LOCAL RESOURCES ARE MISSING!');
  process.exit(1);
}
