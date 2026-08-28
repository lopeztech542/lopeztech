const http = require('http');
const fs = require('fs');
const path = require('path');

const types = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.svg':'image/svg+xml','.ico':'image/x-icon','.jfif':'image/jpeg'};

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/lopeztech-inicio.html';
  const file = path.join(__dirname, url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {'Content-Type': types[ext]||'application/octet-stream'});
    res.end(data);
  });
}).listen(8000, () => console.log('Server running at http://localhost:8000'));