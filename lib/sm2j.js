/* eslint-env node */

const truncate = require('lodash.truncate');
const omitBy = require('lodash.omitby');
const difference = require('lodash.difference');
const path = require('path');
const fs = require('fs');
const yaml = require('yaml-front-matter');

// Side effects:
// - Root node of JSON is files key mapping to a dictionary of files
// - .preview will be first WIDTH characters of the raw content
//   (not translated), if width is not 0
// - .__content is removed (potentially too large)

const processFile = (filename, width, content) => {
  const _basename = path.basename(filename, path.extname(filename));
  const _metadata = yaml.loadFront(filename);

  if (_metadata) {
    // If width is truthy (is defined and and is not 0).
    if (width) {
      // Max of WIDTH chars snapped to word boundaries, trim whitespace
      const truncateOptions = {
        length: width,
        separator: /\s/,
        omission: ' …',
      };
      _metadata.preview = truncate(_metadata.__content.trim(), truncateOptions);
    }

    // If the option is provided keep the entire content in field 'content'
    if (typeof (content) !== 'undefined') {
      _metadata.content = _metadata.__content;
    }
    _metadata.basename = _basename;
  }

  delete _metadata.__content;

  return {
    metadata: _metadata,
    basename: _basename,
  };
};

const getFiles = (filename) => {
  if (fs.lstatSync(filename).isDirectory()) {
    return fs.readdirSync(filename).filter(entry => !entry.isDirectory);
  }
  return [filename];
};

const hasMetadata = obj => Boolean(difference(Object.keys(obj), ['preview', 'basename']).length);

exports.parse = (filenames, options) => {
  const merged = {};

  const files = filenames
    .map(getFiles)
    .reduce((collection, filename) => collection.concat(filename), []);

  files
    .map(file => processFile(file, options.width, options.content))
    .forEach((data) => {
      merged[data.basename] = data.metadata;
    });

  const result = omitBy(merged, obj => !hasMetadata(obj));
  const json = JSON.stringify(result, null, options.minify ? 0 : 2);

  if (options.outfile) {
    const file = fs.openSync(options.outfile, 'w+');
    fs.writeSync(file, `${json}\n`);
    fs.closeSync(file);
  } else {
    return json;
  }

  return null;
};
