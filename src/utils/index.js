const mapDBAlbumToModel = ({ id, name, year }) => ({
  id,
  name,
  year: parseInt(year, 10),
});

const mapDBSongToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  year: parseInt(year, 10),
  performer,
  genre,
  duration: parseInt(duration, 10),
  albumId,
});

const mapDBSongsToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

const mapDBPlaylistsToModel = ({ id, name, username }) => ({
  id,
  name,
  username,
});

module.exports = {
  mapDBAlbumToModel,
  mapDBSongToModel,
  mapDBSongsToModel,
  mapDBPlaylistsToModel,
};
