// ttf2js.js
const fs = require('fs');
const ttf = fs.readFileSync('src/assets/fonts/NotoSansKR-VariableFont_wght.ttf');
const base64 = ttf.toString('base64');
const js = `export default "${base64}";\n`;
fs.writeFileSync('src/assets/fonts/NotoSansKR-VariableFont-normal.js', js);