const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.addPlaylistHandler,
    options: {
      auth: 'musicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistHandler,
    options: {
      auth: 'musicapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}',
    handler: handler.deletePlaylistByIdHandler,
    options: {
      auth: 'musicapi_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: handler.addSongToPlaylistByIdHandler,
    options: {
      auth: 'musicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: handler.getSongFromPlaylistByIdHandler,
    options: {
      auth: 'musicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/activities',
    handler: handler.getPlaylistActivitiesHandler,
    options: {
      auth: 'musicapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: handler.deleteSongFromPlaylistByIdHandler,
    options: {
      auth: 'musicapi_jwt',
    },
  },
];

module.exports = routes;
