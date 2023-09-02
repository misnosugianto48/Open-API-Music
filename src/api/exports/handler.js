const autoBind = require('auto-bind');
const NotFoundError = require('../../exceptions/NotFoundError');

class ExportsHandler {
  constructor(ProducerService, validator, playlistsService) {
    this._producerService = ProducerService;
    this._validator = validator;
    this._playlistsService = playlistsService;

    //  TODO: bind semua nilai sekaligus
    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    //  TODO: validasi payload
    this._validator.validateExportPlaylistsPayload(request.payload);

    //  TODO: validasi user
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { targetEmail } = request.payload;

    console.log('playlistId:', playlistId);
    console.log('credentialId:', credentialId);

    // TODO: verify access
    try {
      await this._playlistsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );
    } catch (error) {
      // Jika verifikasi akses gagal, cek apabila playlist tidak ditemukan (404)
      if (error instanceof NotFoundError) {
        return h
          .response({
            status: 'fail',
            message: 'Playlist not found',
          })
          .code(404);
      }

      // Verifikasi Access, kirimkan status kode 403
      return h
        .response({
          status: 'fail',
          message: 'Forbidden: Kamu tidak mempunyai akses ke playlist',
        })
        .code(403);
    }

    const songs = await this._playlistsService.getSongFromPlaylistById(
      playlistId
    );

    //  TODO: buat object message
    const message = {
      playlistId,
      songs,
      targetEmail,
    };

    //  TODO: kirim pesan ke queue
    await this._producerService.sendMessage(
      'export:playlists',
      JSON.stringify(message)
    );

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
