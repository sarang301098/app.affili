import crypto from 'crypto';
import he from 'he';

export default (parameters, passphrase) => {
  const queryString = Object.keys(parameters)
    .filter(k => k !== 'sha_sign' && typeof parameters[k] !== 'undefined' && parameters[k] !== false && parameters[k] !== '')
    .sort()
    .map(k => k + '=' + he.decode(parameters[k]) + passphrase)
    .join('');
  return crypto.createHash('sha512').update(queryString, 'utf8').digest('hex')
    .toUpperCase();
};
