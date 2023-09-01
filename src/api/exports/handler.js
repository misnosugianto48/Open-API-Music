const autoBind = require('auto-bind');

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

    console.log('playlistId:', playlistId); // Add this line
    console.log('credentialId:', credentialId); // Add this line

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
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
