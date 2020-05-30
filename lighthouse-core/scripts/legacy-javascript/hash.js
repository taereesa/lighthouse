const fs = require('fs');
const crypto = require('crypto');

module.exports = function makeHash() {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(`${__dirname}/yarn.lock`, 'utf8'))
    .update(fs.readFileSync(`${__dirname}/run.js`, 'utf8'))
    .update(fs.readFileSync(`${__dirname}/main.js`, 'utf8'))
    /* eslint-disable max-len */
    .update(fs.readFileSync(require.resolve('../../audits/byte-efficiency/legacy-javascript.js'), 'utf8'))
    /* eslint-enable max-len */
    .digest('hex');
};
