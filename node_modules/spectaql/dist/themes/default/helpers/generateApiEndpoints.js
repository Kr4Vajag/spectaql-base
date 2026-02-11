"use strict";module.exports = function (options) {var _options$data, _options$data2;
  const { url, server, servers } = (options === null || options === void 0 || (_options$data = options.data) === null || _options$data === void 0 ? void 0 : _options$data.root) || {};

  const displayAllServers =
  (options === null || options === void 0 || (_options$data2 = options.data) === null || _options$data2 === void 0 || (_options$data2 = _options$data2.root) === null || _options$data2 === void 0 || (_options$data2 = _options$data2.allOptions) === null || _options$data2 === void 0 || (_options$data2 = _options$data2.specData) === null || _options$data2 === void 0 || (_options$data2 = _options$data2.spectaql) === null || _options$data2 === void 0 ? void 0 : _options$data2.displayAllServers) ===
  true;
  if (!displayAllServers) {
    if (url) {
      return url;
    }
    if (server !== null && server !== void 0 && server.url) {
      return server.url;
    }
    const fallbackServer =
    (servers === null || servers === void 0 ? void 0 : servers.find((server) => server.url && server.production)) || (
    servers === null || servers === void 0 ? void 0 : servers.find((server) => server.url));
    if (fallbackServer) {
      return fallbackServer.url;
    }
  }

  if (!(servers !== null && servers !== void 0 && servers.length)) {
    return '<<url is missing>>';
  }

  return servers.
  map(
    (server) => {var _server$description, _server$url;return (
        '# ' + (
        ((_server$description = server.description) === null || _server$description === void 0 ? void 0 : _server$description.trim()) || 'Endpoint') +
        ':\n' + (
        ((_server$url = server.url) === null || _server$url === void 0 ? void 0 : _server$url.trim()) || '<<url is missing>>') +
        '\n');}
  ).
  join('');
};