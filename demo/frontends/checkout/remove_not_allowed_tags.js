const path = require('path');
const fs = require('fs');

function removeUnwantedTags(file) {
  console.log(`removing unwanted tags for micro front-ends for ${file}`);

  const content = fs.readFileSync(file, 'utf8')
    .replace('<head>', '')
    .replace('</head>', '');

  fs.writeFileSync(file, content);
}

const isFile = (source) => fs.lstatSync(source).isFile();
const getPages = (source) => fs.readdirSync(source)
  .map((name) => path.join(source, name))
  .filter(isFile)
  .filter((fileName) => fileName.endsWith('.html'));

getPages('./dist/')
  .forEach((pageFile) => removeUnwantedTags(pageFile));
