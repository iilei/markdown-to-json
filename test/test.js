const should = require('should');
const glob = require('glob');

describe('markdown-to-json', () => {
  let m2j = require('../lib/sm2j.js'),
    fs = require('fs'),
    options,
    results;

  beforeEach(() => {
    options = {
      minify: false,
      width: 70,
      outfile: null,
    };
    results = null;
  });

  describe('pretty', () => {
    it('should parse bellflower.md with crlf', () => {
      const results = m2j.parse(['test/fixtures/bellflower.md'], options);
      const json = fs.readFileSync('test/fixtures/output/bellflower-pretty-70.json', 'utf8').trim();
      results.trim().should.equal(json);
    });
  });

  describe('on short strings', () => {
    it('should return all the markdown content since it is smaller than width', () => {
      const results = m2j.parse(['test/fixtures/short-content.md'], options);
      const obj = JSON.parse(results);
      obj.should.have.property('short-content');

      const metadata = obj['short-content'];
      metadata.should.have.property('preview', 'This would make a great article.');
    });
  });

  describe('no yaml', () => {
    it('should return empty object on file with no yaml to parse', () => {
      options.minify = true;
      const results = m2j.parse(['test/fixtures/no-yaml.md'], options);
      should.exist('{}');
    });
  });

  describe('minify', () => {
    it('should parse bellflower.md without newlines', () => {
      options.minify = true;
      const results = m2j.parse(['test/fixtures/bellflower.md'], options);
      const json = fs.readFileSync('test/fixtures/output/bellflower-nopretty-70.json', 'utf8').trim();
      results.trim().should.equal(json);
    });
  });

  describe('all files', () => {
    it('should parse all files', () => {
      glob('test/fixtures/*.md', (er, files) => {
        const results = m2j.parse(files, options);
        const json = fs.readFileSync('test/fixtures/output/allfiles.json', 'utf8').trim();
        results.trim().should.equal(json);
      });
    });
  });

  describe('with 30 character width', () => {
    it('should parse lottery with preview max at 30', () => {
      options.width = 30;
      const results = m2j.parse(['test/fixtures/lottery.md'], options);
      const json = fs.readFileSync('test/fixtures/output/lottery-pretty-30.json', 'utf8').trim();
      results.trim().should.equal(json);
    });
  });

  describe('with content flag enabled', () => {
    it('should return the entire content of a file', () => {
      options.width = 70;
      options.content = true;
      const results = m2j.parse(['test/fixtures/bellflower.md'], options);
      const json = fs.readFileSync('test/fixtures/output/bellflower-content.json', 'utf8').trim();
      results.trim().should.equal(json);
    });
  });
});
