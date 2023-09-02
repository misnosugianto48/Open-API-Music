const autoBind = require('auto-bind');
const config = require('../../utils/config');

class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    //  TODO: bind semua nilai sekaligus
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'unnamed', year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'ALbum berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async postUploadCoverAlbumHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    this._validator.validateCoverAlbumPayload(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${config.app.host}:${config.app.port}/albums/{id}/covers/${filename}`;

    await this._albumsService.editCoverAlbumById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikesHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._albumsService.getAlbumById(albumId);

      const isLiked = await this._albumsService.isAlbumAlreadyLikes(
        credentialId,
        albumId
      );

      if (isLiked) {
        const response = h.response({
          status: 'fail',
          message: 'Album sudah dilikes',
        });
        response.code(400);
        return response;
      }

      await this._albumsService.addAlbumLike(credentialId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Album berhasil dilikes',
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message || 'Internal server error',
      });
      response.code(404);
      return response;
    }
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._albumsService.getAlbumWithSongs(id);

    const response = {
      status: 'success',
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
          coverUrl: album.cover,
          songs: songs.length > 0 ? songs : [],
        },
      },
    };

    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    const { likes, isCached } = await this._albumsService.getAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    response.code(200);

    if (isCached) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'ALbum berhasil diperbaharui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._albumsService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'ALbum berhasil dihapus',
    };
  }

  async deleteAlbumLikesHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._albumsService.getAlbumById(albumId);

      const isLiked = await this._albumsService.isAlbumAlreadyLikes(
        credentialId,
        albumId
      );

      if (!isLiked) {
        const response = h.response({
          status: 'fail',
          message: 'Likes tidak ditemukan',
        });
        response.code(404);
        return response;
      }

      await this._albumsService.deleteAlbumLike(credentialId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Likes berhasil dihapus',
      });
      return response;
    } catch (error) {
      const response = h.response({
        status: 'error',
        message: error.message || 'Internal server error',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = AlbumsHandler;
