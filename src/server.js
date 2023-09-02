require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const config = require('./utils/config');

// albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongsValidator = require('./validator/songs');
const SongsService = require('./services/postgres/SongsService');

// users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

//  playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistValidator = require('./validator/playlists');
const ActivitiesService = require('./services/postgres/ActivitiesService');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// storage
const StorageService = require('./services/storage/StorageService');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const activitiesService = new ActivitiesService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/albums/images')
  );

  console.log(config);
  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('musicapi_jwt', 'jwt', {
    keys: config.jwtToken.accessToken,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwtToken.ageToken,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        albumsService,
        storageService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        activitiesService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        ProducerService,
        validator: ExportsValidator,
        playlistsService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    //  dapatkan konteks response dari request
    const { response } = request;

    if (response instanceof Error) {
      //  tangani client error secara internal
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      //  mempertahankan penanganan client error oleh hapi secara nativ, contoh 404.
      if (!response.isServer) {
        return h.continue;
      }

      //  penanganan server error
      console.log(response);
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    //  jika bukan error, lanjutkan response sebelumnya
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
