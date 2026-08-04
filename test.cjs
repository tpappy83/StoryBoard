// This script will inject a window.onerror handler into index.html
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('window.onerror')) {
  html = html.replace('<head>', '<head><script>window.onerror = function(m,u,l,c,e) { fetch("/api/log?error=" + encodeURIComponent(e ? e.stack : m)); };</script>');
  fs.writeFileSync('index.html', html);
}
