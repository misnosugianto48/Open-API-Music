const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    //  TODO: bind semua nilai sekaligus
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'unnamed', year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

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

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getAlbumWithSongs(id);

    const response = {
      status: 'success',
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
          songs: songs.length > 0 ? songs : [],
        },
      },
    };

    return response;
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'ALbum berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'ALbum berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
