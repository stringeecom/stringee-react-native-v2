const fs = require('node:fs');
const path = require('node:path');

fs.rmSync(path.join(__dirname, '..', 'lib'), {
  force: true,
  recursive: true,
});
