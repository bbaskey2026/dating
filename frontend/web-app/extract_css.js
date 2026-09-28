const fs = require('fs');
const path = require('path');

const tsxPath = path.resolve(__dirname, '../src/pages/LandingPage.tsx');
const cssPath = path.resolve(__dirname, '../src/pages/LandingPage.css');

const content = fs.readFileSync(tsxPath, 'utf8');

const startTag = '<style>{`';
const endTag = '`}</style>';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find style tags');
  process.exit(1);
}

const cssContent = content.substring(startIndex + startTag.length, endIndex).trim();
fs.writeFileSync(cssPath, cssContent + '\n', 'utf8');
console.log('LandingPage.css created successfully, length:', cssContent.length);

let updatedTsx = content.substring(0, startIndex) + content.substring(endIndex + endTag.length);

if (!updatedTsx.includes("import './LandingPage.css';")) {
  updatedTsx = "import './LandingPage.css';\n" + updatedTsx;
}

fs.writeFileSync(tsxPath, updatedTsx, 'utf8');
console.log('LandingPage.tsx updated successfully');
