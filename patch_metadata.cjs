const fs = require('fs');
const meta = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
if (!meta.requestFramePermissions) {
  meta.requestFramePermissions = [];
}
if (!meta.requestFramePermissions.includes('camera')) {
  meta.requestFramePermissions.push('camera');
}
fs.writeFileSync('metadata.json', JSON.stringify(meta, null, 2));
console.log("Patched metadata.json");
