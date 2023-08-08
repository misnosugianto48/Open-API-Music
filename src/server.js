require('dotenv').config();

const Hapi = require('@hapi/hapi');
// const Jwt = require('@hapi/jwt');

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

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // register plugin eksternal
  // await server.register([
  //   {
  //     plugin: Jwt,
  //   },
  // ]);

  // definisinkan strategy autentikasi jwt
  // server.auth.strategy([
  //   'musicapi_jwt',
  //   'jwt',
  //   {
  //     keys: process.env.ACCESS_TOKEN_KEY,
  //     verify: {
  //       aud: false,
  //       iss: false,
  //       sub: false,
  //       maxAgeSec: process.env.ACCESS_TOKEN_AGE,
  //     },
  //     validate: (artifacts) => ({
  //       isValid: true,
  //       credential: {
  //         id: artifacts.decoded.payload.id,
  //       },
  //     }),
  //   },
  // ]);

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
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
