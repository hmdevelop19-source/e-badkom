const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/ProfilLembagaPage.tsx',
  'src/pages/ProfilUtdPage.tsx',
  'src/pages/RiwayatUtdPage.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/import axios from 'axios';/g, "import api from '../api/client';");
  content = content.replace(/axios\.get/g, "api.get");
  content = content.replace(/axios\.put/g, "api.put");
  content = content.replace(/axios\.post/g, "api.post");
  content = content.replace(/http:\/\/127\.0\.0\.1:8000\/api/g, "");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', file);
}
