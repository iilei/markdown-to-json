const should = require('should');
const glob = require('glob');
const fs = require('fs');
const sm2j = require('../lib/sm2j.js');

const options = {
  width: 70,
  outfile: null,
};

describe('markdown-to-json', () => {
  describe('pretty', () => {
    it('should parse bellflower.md with crlf', () => {
      const results = sm2j.parse(['test/fixtures/bellflower.md'], options);
      const json = fs.readFileSync('test/fixtures/output/bellflower-pretty-70.json', 'utf8').trim();
      results.trim().should.equal(json);
    });
  });

  describe('on short strings', () => {
    it('should return all the markdown content since it is smaller than width', () => {
      const results = sm2j.parse(['test/fixtures/short-content.md'], options);
      const obj = JSON.parse(results);
      obj.should.have.property('short-content');

      const metadata = obj['short-content'];
      metadata.should.have.property('preview', 'This would make a great article.');
    });
  });

  describe('no yaml', () => {
    it('should return empty object on file with no yaml to parse', () => {
      const results = sm2j.parse(['test/fixtures/no-yaml.md'], { ...options, minify: true });
      results.trim().should.equal('{}');
    });
  });

  describe('minify', () => {
    it('should parse bellflower.md without newlines', () => {
      const results = sm2j.parse(['test/fixtures/bellflower.md'], { ...options, minify: true });
      const json = fs.readFileSync('test/fixtures/output/bellflower-nopretty-70.json', 'utf8').trim();
      results.trim().should.equal(json);
    });
  });

  describe('all files', () => {
    it('should parse all files', () => {
      glob('test/fixtures/*.md', (er, files) => {
        const results = sm2j.parse(files, options);
        const json = fs.readFileSync('test/fixtures/output/allfiles.json', 'utf8').trim();
        results.trim().should.equal(json);
      });
    });
  });

  describe('with 30 character width', () => {
    it('should parse lottery with preview max at 30', () => {
      const results = sm2j.parse(['test/fixtures/lottery.md'], { ...options, width: 30 });
      const json = fs.readFileSync('test/fixtures/output/lottery-pretty-30.json', 'utf8').trim();
      results.trim().should.equal(json);
    });
  });

  describe('with content flag enabled', () => {
    it('should return the entire content of a file', () => {
      const results = sm2j.parse(['test/fixtures/bellflower.md'], { ...options, width: 70, content: true });
      const json = fs.readFileSync('test/fixtures/output/bellflower-content.json', 'utf8').trim();
      results.trim().should.equal(json);
    });
  });
});
