const http = require('http');
const originalRemoveHeader = http.ServerResponse.prototype.removeHeader;
http.ServerResponse.prototype.removeHeader = function (name) {
  if (this.headersSent) {
    return;
  }
  try {
    return originalRemoveHeader.call(this, name);
  } catch (e) {
    // ignore
  }
};
console.log('✔ Patched Node v24 removeHeader for Cypress proxy');
