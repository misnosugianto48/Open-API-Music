const autoBind = require('auto-bind');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistHandler {
  constructor(playlistsService, activitiesService, validator) {
    this._playlistsService = playlistsService;
    this._activitiesService = activitiesService;
    this._validator = validator;

    //  TODO: bind semua nilai sekaligus
    autoBind(this);
  }

  async addPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
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
    const playlists = await this._playlistsService.getPlaylists(credentialId);

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

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deletePlaylistById(playlistId);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async addSongToPlaylistByIdHandler(request, h) {
    //  TODO: validasi song payload
    this._validator.validateSongPayload(request.payload);

    // TODO: validasi request auth dan params
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    //  TODO: verify song exist
    await this._playlistsService.verifySongPlaylist(songId);

    // TODO: verify access
    try {
      // Verifikasi akses ke playlist, dan jika akses tidak diizinkan, kirimkan status kode 403
      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );
    } catch (error) {
      return h
        .response({
          status: 'fail',
          message: 'Forbidden: You do not have access to this playlist',
        })
        .code(403);
    }

    await this._playlistsService.addSongToPlaylistById(playlistId, songId);

    // TODO: add activities
    await this._activitiesService.addPlaylistActivities(
      playlistId,
      songId,
      credentialId,
      'add'
    );

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongFromPlaylistByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // TODO: verify access
    try {
      // Verifikasi akses ke playlist, dan jika akses tidak diizinkan, kirimkan status kode 403
      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );
    } catch (error) {
      // Jika verifikasi akses gagal, cek apakah itu kesalahan playlist tidak ditemukan (404)
      if (error instanceof NotFoundError) {
        return h
          .response({
            status: 'fail',
            message: 'Playlist not found',
          })
          .code(404);
      }

      // Jika bukan kesalahan playlist tidak ditemukan, kirimkan status kode 403
      return h
        .response({
          status: 'fail',
          message: 'Forbidden: You do not have access to this playlist',
        })
        .code(403);
    }

    const playlists = await this._playlistsService.getPlaylistById(playlistId);

    const songs = await this._playlistsService.getSongFromPlaylistById(
      playlistId
    );

    const response = {
      status: 'success',
      data: {
        playlist: {
          ...playlists,
          songs,
        },
      },
    };

    return response;
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // TODO: verify access
    try {
      // Verifikasi akses ke playlist, dan jika akses tidak diizinkan, kirimkan status kode 403
      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );
    } catch (error) {
      // Jika verifikasi akses gagal, cek apakah itu kesalahan playlist tidak ditemukan (404)
      if (error instanceof NotFoundError) {
        return h
          .response({
            status: 'fail',
            message: 'Playlist not found',
          })
          .code(404);
      }

      // Jika bukan kesalahan playlist tidak ditemukan, kirimkan status kode 403
      return h
        .response({
          status: 'fail',
          message: 'Forbidden: You do not have access to this playlist',
        })
        .code(403);
    }

    const activities = await this._activitiesService.getPlaylistActivities(
      playlistId
    );

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }

  async deleteSongFromPlaylistByIdHandler(request, h) {
    // TODO : dapatkan playlistId dari path params
    const { playlistId } = request.params;

    // TODO : verifikasi song
    const { songId } = request.payload;
    await this._validator.validateSongPayload(request.payload);

    // TODO : dapatkan user terautentifikasi
    const { id: credentialId } = request.auth.credentials;

    // TODO: verify access
    try {
      // Verifikasi akses ke playlist, dan jika akses tidak diizinkan, kirimkan status kode 403
      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );
    } catch (error) {
      return h
        .response({
          status: 'fail',
          message: 'Forbidden: You do not have access to this playlist',
        })
        .code(403);
    }

    await this._playlistsService.getPlaylistById(credentialId, playlistId);

    await this._playlistsService.deleteSongFromPlaylistById(playlistId, songId);
    // TODO: add activities
    await this._activitiesService.addPlaylistActivities(
      playlistId,
      songId,
      credentialId,
      'delete'
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistHandler;
