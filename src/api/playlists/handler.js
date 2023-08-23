const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    //  TODO: bind semua nilai sekaligus
    autoBind(this);
  }

  async addPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async addSongToPlaylistByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { songId } = request.payload;
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifySongPlaylist(songId);
    await this._service.verifyPlaylistOwner(playlistId, credentialId);
    await this._service.addSongToPlaylistById(playlistId, songId);
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongFromPlaylistByIdHandler(request) {
    // TODO : dapatkan playlistId dari path params
    const { playlistId } = request.params;

    // TODO : dapatkan user ter-auth
    const { id: credentialId } = request.auth.credentials;

    // TODO : verifikasi data playlist
    // TODO : verifikasi user pemilik playlist
    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const playlists = await this._service.getPlaylistById(
      credentialId,
      playlistId
    );
    const songs = await this._service.getSongFromPlaylistById(playlistId);

    return {
      status: 'success',
      data: {
        playlist: {
          ...playlists,
          songs,
        },
      },
    };
  }

  async deleteSongFromPlaylistByIdHandler(request) {
    // TODO : dapatkan playlistId dari path params
    const { playlistId } = request.params;

    // TODO : verifikasi song payload
    await this._validator.validateSongPayload(request.payload);
    const { songId } = request.payload;

    // TODO : dapatkan user terautentifikasi
    const { id: credentialId } = request.auth.credentials;

    // TODO : pastikan playlist ada
    // TODO : verifikasi user playlists
    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    await this._service.deleteSongFromPlaylistById(playlistId, songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistHandler;
