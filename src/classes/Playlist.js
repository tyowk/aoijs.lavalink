const { AoiError, Track } = require('./Utils.js');

/**
 * Playlist class to handle playlists.
 *
 * @class Playlist
 * @param {Shoukaku} manager - The manager instance.
 * @param {Client} client - The discord client instance.
 * @param {Object} options - The playlist setup options.
 * @throws {AoiError} - Throws an error if the setup is invalid.
 */
exports.Playlist = class Playlist {
    constructor(manager, options) {
        if (options?.enable !== true) return;

        if (!manager) throw new AoiError('Manager instance is not defined.', 'PLAYLIST_MANAGER_INVALID');

        if (!manager.client) throw new AoiError('Client instance is not defined.', 'PLAYLIST_CLIENT_INVALID');

        if (!options.database && !manager.client?.db)
            throw new AoiError(
                'Database instance is not defined, playlist feature required database!',
                'PLAYLIST_DATABASE_INVALID',
            );

        if (!options || typeof options !== 'object')
            throw new AoiError('Invalid playlist options provided.', 'PLAYLIST_OPTIONS_INVALID');

        if (
            !options.table ||
            (options.table &&
                !options.database?.tables?.includes(options.table) &&
                !manager.client.db?.tables?.includes(options.table))
        )
            throw new AoiError(`Table "${options.table}" not found. Please provide one.`, 'PLAYLIST_TABLE_INVALID');

        this.manager = manager;
        this.client = manager.client;
        this.options = options;
        this.database = options.database || this.client.db;
        this.maxSongs = isNaN(options.maxSongs) ? 20 : options.maxSongs;
        this.maxPlaylist = isNaN(options.maxPlaylist) ? 5 : options.maxPlaylist;
        this.manager.playlist = this;
        this.client.playlist = this;
    }

    /**
     * Check if a playlist exists for a user.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @returns {Promise<boolean>} - Whether the playlist exists.
     */
    async exists(name, id) {
        let data = await this.database.get(this.options.table, name, id ? `playlist_${id}` : id);
        try {
            data = JSON.parse(data.value);
            return data && Array.isArray(data);
        } catch {
            return data && Array.isArray(data?.value);
        }
    }

    /**
     * Create a new playlist for a user.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @returns {Promise<boolean>} - Whether the playlist was created successfully.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async create(name, id) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (name?.length > 255)
            throw new AoiError('Playlist name length cannot exceed 255 characters', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');
        if (await this.exists(name, id)) throw new AoiError(`Playlist "${name}" already exists`, 'PLAYLIST_EXISTS');
        if ((await this.count(id)) >= this.maxPlaylist)
            throw new AoiError(`Maximum playlist limit reached: ${this.maxPlaylist}`, 'PLAYLIST_MAX_PLAYLIST');

        await this.database.set(this.options.table, name, id ? `playlist_${id}` : id, []);
        return true;
    }

    /**
     * Delete a playlist for a user.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @returns {Promise<boolean>} - Whether the playlist was deleted successfully.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async delete(name, id) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');
        if (!(await this.exists(name, id))) throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');

        await this.database.delete(this.options.table, name, id ? `playlist_${id}` : id);
        return true;
    }

    /**
     * Update an existing playlist with new data.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @param {Array} newData - New playlist data.
     * @returns {Promise<boolean>} - Whether the playlist was updated successfully.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async update(name, id, newData) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');
        if (!newData || !Array.isArray(newData))
            throw new AoiError('New data is required to update the playlist', 'PLAYLIST_UPDATE_DATA_INVALID');
        if (!(await this.exists(name, id))) throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');

        try {
            newData = newData?.filter(Boolean);
            newData = JSON.stringify(newData);
        } catch {}

        await this.database.set(this.options.table, name, id ? `playlist_${id}` : id, newData);
        return true;
    }

    /**
     * Add a track to a user's playlist.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @param {Track} track - The track to add.
     * @returns {Promise<boolean>} - Whether the track was added successfully.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async addTrack(name, id, track) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');
        if (!(track instanceof Track)) throw new AoiError('Invalid track object', 'PLAYLIST_TRACK_INVALID');

        const playlist = await this.get(name, id);
        if (!playlist || !Array.isArray(playlist))
            throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');
        if (playlist.length >= this.maxSongs)
            throw new AoiError(`Maximum songs limit reached: ${this.maxSongs}`, 'PLAYLIST_MAX_SONGS');

        playlist.push(track);
        await this.update(name, id, playlist?.filter(Boolean));
        return true;
    }

    /**
     * Remove a track from a user's playlist.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @param {string|number} index - The index or track ID of the track to remove.
     * @returns {Promise<boolean>} - Whether the track was removed successfully.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async removeTrack(name, id, index) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');

        const playlist = await this.get(name, id);
        if (!playlist || !Array.isArray(playlist))
            throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');
        if (index > playlist.length || index < 1 || isNaN(index))
            throw new AoiError('Track not found in playlist', 'PLAYLIST_TRACK_NOT_FOUND');

        playlist.splice(index - 1, 1);
        await this.update(name, id, playlist?.filter(Boolean));
        return true;
    }

    /**
     * Get a specific track from a user's playlist by index.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @param {number} index - The index of the track to retrieve (1-based index).
     * @returns {Promise<Track>} - The track object at the specified index.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async getTrack(name, id, index) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');

        const playlist = await this.get(name, id);
        if (!playlist || !Array.isArray(playlist))
            throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');
        if (index > playlist.length || index < 1 || isNaN(index))
            throw new AoiError('Track not found in playlist', 'PLAYLIST_TRACK_NOT_FOUND');

        return playlist?.filter(Boolean)?.[index - 1];
    }

    /**
     * Get the number of tracks in a user's playlist.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @returns {Promise<number>} - The number of tracks in the playlist.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async length(name, id) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');

        const playlist = await this.get(name, id);
        if (!playlist) throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');

        return Array.isArray(playlist) ? playlist?.filter(Boolean)?.length : 0;
    }

    /**
     * Get the number of playlists a user has.
     *
     * @async
     * @param {string} id - User ID.
     * @returns {Promise<number>} - The number of playlists.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async count(id) {
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');

        const playlists = await this.database.all(this.options.table, data =>
            data?.key?.includes(id ? `_playlist_${id}` : id),
        );

        return Array.isArray(playlists) ? playlists?.filter(Boolean)?.length : 0;
    }

    /**
     * Show a playlist names a user has.
     *
     * @async
     * @param {string} id - User ID.
     * @returns {Promise<Array|null>} - The number of playlists.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async show(id) {
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');

        const playlists = await this.database.all(this.options.table, data =>
            data?.key?.includes(id ? `playlist_${id}` : id),
        );

        return Array.isArray(playlists)
            ? playlists
                  .map(row => {
                      try {
                          row.value = JSON.parse(row.value);
                      } catch {}

                      return {
                          name: row.key?.replaceAll(id ? `_playlist_${id}` : id, ''),
                          length: row.value?.length,
                      };
                  })
                  .filter(Boolean)
            : null;
    }

    /**
     * Move a track in a user's playlist from one position to another.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @param {number} from - The current position of the track.
     * @param {number} to - The target position for the track.
     * @returns {Promise<boolean>} - Whether the track was moved successfully.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async moveTrack(name, id, from, to) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');
        if (isNaN(from) || isNaN(to) || from < 1 || to < 1)
            throw new AoiError('Please provide a valid track position', 'PLAYLIST_POSITION_INVALID');

        let playlist = await this.get(name, id);
        if (!playlist || !Array.isArray(playlist))
            throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');
        if (from > playlist.length || to > playlist.length)
            throw new AoiError('Track not found in playlist', 'PLAYLIST_TRACK_NOT_FOUND');

        const track = playlist.splice(from - 1, 1)[0];
        playlist.splice(to - 1, 0, track);
        await this.update(name, id, playlist?.filter(Boolean));
        return true;
    }

    /**
     * Clear all tracks from a user's playlist.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @returns {Promise<boolean>} - Whether the playlist was cleared successfully.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async clear(name, id) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User   ID is required', 'PLAYLIST_ID_INVALID');
        if (!(await this.exists(name, id))) throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');

        await this.update(name, id, []);
        return true;
    }

    /**
     * Renaming a playlist.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @param {string} newName - New playlist name.
     * @returns {Promise<boolean>} - Whether the playlist was renamed successfully.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async rename(name, id, newName) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!newName) throw new AoiError('New playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User  ID is required', 'PLAYLIST_ID_INVALID');

        const playlist = await this.get(name, id);
        if (!playlist || !Array.isArray(playlist))
            throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');

        await this.delete(name, id);
        await this.create(newName, id);
        await this.update(newName, id, playlist?.filter(Boolean));
        return true;
    }

    /**
     * Get a user's playlist.
     *
     * @async
     * @param {string} name - Playlist name.
     * @param {string} id - User ID.
     * @returns {Promise<Array>} - The playlist as an array of tracks.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async get(name, id) {
        if (!name) throw new AoiError('Playlist name is required', 'PLAYLIST_NAME_INVALID');
        if (!id) throw new AoiError('User   ID is required', 'PLAYLIST_ID_INVALID');
        const data = await this.database.get(this.options.table, name, id ? `playlist_${id}` : id);
        if (!data || !data.value) throw new AoiError(`Playlist "${name}" not found`, 'PLAYLIST_NOT_FOUND');

        try {
            return JSON.parse(data.value);
        } catch {
            return data.value;
        }
    }
};
