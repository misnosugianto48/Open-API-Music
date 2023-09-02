const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (
    server,
    { playlistsService, activitiesService, validator }
  ) => {
    const playlistsHandler = new PlaylistHandler(
      playlistsService,
      activitiesService,
      validator
    );
    server.route(routes(playlistsHandler));
  },
};
