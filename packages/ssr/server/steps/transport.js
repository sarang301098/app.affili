// import shouldForce200 from '../utils/shouldForce200';

// Impure function
/* eslint-disable no-param-reassign */
const transport = (stepResults) => {
  /*
  // disabled, because docker overlay network does not give us the user ip
  const formerHash = stepResults.req.headers && stepResults.req.headers['if-none-match'];
  if (stepResults.statusCode === 200 && formerHash && formerHash === stepResults.hash) {
    const callerIp = stepResults.req.socket && stepResults.req.socket.remoteAddress
      ? stepResults.req.socket.remoteAddress
      : 'undefined';
    if (!shouldForce200(callerIp)) stepResults.statusCode = 304;
  }
  */

  stepResults.req.res.statusCode = stepResults.statusCode;
  switch (stepResults.statusCode) {
    // OK
    case 200:
      stepResults.res.set({
        ETag: stepResults.hash,
        'Cache-Control': 'public, no-cache',
        'content-type': 'text/html',
      });
      stepResults.res.end(stepResults.html + '\n<!-- from cache: ' + stepResults.isFromCache + ' -->');
      break;
    // Redirect
    case 301:
      stepResults.res.writeHead(301, { Location: stepResults.Location });
      stepResults.res.end();
      break;
    // Temp. Redirect
    case 302:
      stepResults.res.writeHead(302, { Location: stepResults.Location });
      stepResults.res.end();
      break;
    // Not modified
    case 304:
      stepResults.res.writeHead(304);
      stepResults.res.end();
      break;
    // Not found
    case 404:
      stepResults.req.res.statusMessage = 'Not found';
      stepResults.res.writeHead(404, { 'content-type': 'text/html' });
      stepResults.res.end(stepResults.html);
      break;
    case 500:
      stepResults.res.writeHead(500);
      stepResults.res.end(stepResults.serverError.message);
      break;
    default:
  }
};
export default transport;
