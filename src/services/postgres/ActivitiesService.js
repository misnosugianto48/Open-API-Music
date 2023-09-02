const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModelPlaylistActivities } = require('../../utils');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylistActivities(playlistId, songId, owner, action) {
    const id = nanoid(16);
    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, owner, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }
  }

  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.time, playlist_song_activities.action FROM playlist_song_activities
      INNER JOIN playlists ON playlists.id = playlist_song_activities.playlist_id
      INNER JOIN users ON users.id = playlist_song_activities.user_id
      INNER JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    console.log('Query:', query);

    // Eksekusi query ke database di sini

    const result = await this._pool.query(query);
    console.log(result);
    return result.rows.map(mapDBToModelPlaylistActivities);
  }
}

module.exports = ActivitiesService;
