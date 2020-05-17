const path = require('path');
const fs = require('fs');

const isDirectory = (source) => fs.lstatSync(source).isDirectory();
const getDirectories = (source) => fs.readdirSync(source).map((name) => path.join(source, name)).filter(isDirectory);

const getAllPages = (pageRoot) => getDirectories(pageRoot)
  .reduce((acc, pageDirectory) => {
    const basename = path.basename(pageDirectory);
    return {
      ...acc,
      [basename]: {
        entry: `${pageDirectory}/index.ts`,
        template: `public/${basename}.html`,
        filename: `${basename}.html`,
        chunks: ['chunk-vendors', 'chunk-common', basename],
      },
    };
  }, {});

getAllPages('src/pages/');

module.exports = {
  lintOnSave: false,
  publicPath: 'http://localhost:8080/',
  pages: getAllPages('src/pages'),
};
