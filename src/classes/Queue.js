const { Dispatcher } = require('./Dispatcher.js');
const { Track, AoiError } = require('./Utils.js');
const { Group } = require('@aoijs/aoi.structures');

/**
 * Queue class to manage audio dispatchers for each guild.
 *
 * @class Queue
 * @extends Map
 * @param {Client} client - The discord client instance.
 * @param {Object} options - Configuration options for the queue.
 */
exports.Queue = class Queue extends Group {
    constructor(client, options) {
        super();
        this.client = client;
        this.options = options;
    }

    /**
     * Creates a new dispatcher for the specified guild and joins the voice channel.
     *
     * @async
     * @param {Guild} guild - The guild (server) where the dispatcher will be created.
     * @param {VoiceChannel} voice - The voice channel to join.
     * @param {TextChannel} channel - The text channel associated with the voice channel.
     * @param {Node} [givenNode] - An optional node to use for the dispatcher.
     * @returns {Dispatcher} - The created dispatcher instance.
     * @throws {AoiError} - Throws an error if no voice or text channel is provided.
     */
    async create(guild, voice, channel, givenNode, deaf = true, mute = false) {
        let dispatcher = this.get(guild.id);
        if (!voice) throw new AoiError('No voice channel was provided', 'AOI_VOICE_INVALID');
        if (!channel) throw new AoiError('No text channel was provided', 'AOI_TEXT_INVALID');
        if (!guild) throw new AoiError('No guild was provided', 'AOI_GUILD_INVALID');

        if (!dispatcher) {
            const node = givenNode || this.client.shoukaku.getIdealNode();
            const player = await this.client.shoukaku.joinVoiceChannel({
                guildId: guild.id,
                channelId: voice.id,
                shardId: guild.shard?.id,
                deaf,
                mute
            });

            dispatcher = new Dispatcher({
                client: this.client,
                guildId: guild.id,
                channelId: channel.id,
                player,
                node
            });

            this.set(guild.id, dispatcher);
            this.client.shoukaku.emit('playerCreate', {
                player: dispatcher?.player,
                track: dispatcher?.current,
                dispatcher
            });
            return dispatcher;
        } else {
            return dispatcher;
        }
    }

    /**
     * Searches for a track using the specified query and type.
     *
     * @async
     * @param {string} query - The search query for the track.
     * @param {string} [type] - The type of search engine to use (e.g., 'youtube', 'spotify').
     * @returns {Object|null} - The search result or null if an error occurs.
     */
    async search(query, type) {
        const node = this.client.shoukaku.getIdealNode();
        const regex = /^https?:\/\//;
        type = type
            ?.toLowerCase()
            .replace('youtube', 'ytsearch')
            .replace('spotify', 'spsearch')
            .replace('soundcloud', 'scsearch')
            .replace('deezer', 'dzsearch')
            .replace('applemusic', 'amsearch')
            .replace('youtubemusic', 'ytmsearch');

        try {
            return await node.rest.resolve(
                regex.test(query) ? query : `${(type ? type : this.options.searchEngine) || 'ytsearch'}:${query}`
            );
        } catch (err) {
            return null;
        }
    }

    /**
     * Builds a track object with additional user information.
     *
     * @param {Object} track - The track data to build from.
     * @param {Object} user - The user requesting the track.
     * @param {Object} playlist - The playlist data to build from.
     * @returns {Object} - The constructed track object.
     * @throws {AoiError} - Throws an error if the track is not provided.
     */
    buildTrack(track, user, playlist) {
        return new Track(track, user, playlist);
    }
};
