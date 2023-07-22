const mapDBAlbumToModel = ({ id, name, year }) => ({
  id,
  name,
  year: parseInt(year),
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
  year: parseInt(year),
  performer,
  genre,
  duration: parseInt(duration),
  albumId,
});

const mapDBSongsToModel = ({ id, title, performer }) => ({
  id,
  title,
  performer,
});

module.exports = { mapDBAlbumToModel, mapDBSongToModel, mapDBSongsToModel };
