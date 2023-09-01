const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (
    server,
    { ProducerService, validator, playlistsService }
  ) => {
    const exportsHandler = new ExportsHandler(
      ProducerService,
      validator,
      playlistsService
    );
    server.route(routes(exportsHandler));
  },
};
