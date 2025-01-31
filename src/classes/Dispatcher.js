const { Track, Queue, History } = require('./Utils.js');

/**
 * Dispatcher class to manage the playback of music tracks in a guild.
 *
 * @class Dispatcher
 * @param {Object} options - Configuration options for the dispatcher.
 * @param {Client} options.client - The discord client instance.
 * @param {string} options.guildId - The ID of the guild (server) where the dispatcher operates.
 * @param {string} options.channelId - The ID of the voice channel where the player is connected.
 * @param {Player} options.player - The player instance used for playback.
 * @param {Node} options.node - The node instance used for connecting to the music service.
 */
exports.Dispatcher = class Dispatcher {
    constructor(options) {
        this.client = options.client;
        this.guildId = options.guildId;
        this.channelId = options.channelId;
        this.player = options.player;
        this.node = options.node;

        this.queue = new Queue();
        this.history = new History();
        this.filter = null;
        this.stopped = false;
        this.previous = null;
        this.current = null;
        this.nowPlaying = null;
        this.loop = 'off';
        this.shuffle = false;
        this.paused = false;
        this.autoplay = false;
        this.autoplayType = this.client?.music?.searchEngine || 'ytsearch';
        this.currentVolume = 100;
        this.repeat = 0;

        this.player
            .on('start', () => {
                if (!this.history.length)
                    this.client.shoukaku.emit('queueStart', {
                        player: this.player,
                        track: this.current,
                        dispatcher: this
                    });
                this.client.shoukaku.emit('trackStart', {
                    player: this.player,
                    track: this.current,
                    dispatcher: this
                });
            })
            .on('end', () => {
                this.client.shoukaku.emit('trackEnd', {
                    player: this.player,
                    track: this.current,
                    dispatcher: this
                });
            })
            .on('stuck', () => {
                this.client.shoukaku.emit('trackStuck', {
                    player: this.player,
                    track: this.current,
                    dispatcher: this
                });
            })
            .on('closed', () => {
                this.client.shoukaku.emit('socketClosed', {
                    player: this.player,
                    track: this.current,
                    dispatcher: this
                });
            })
            .on('exception', () => {
                this.client.shoukaku.emit('playerException', {
                    player: this.player,
                    track: this.current,
                    dispatcher: this
                });
            })
            .on('update', () => {
                this.client.shoukaku.emit('playerUpdate', {
                    player: this.player,
                    track: this.current,
                    dispatcher: this
                });
            });
    }

    /**
     * Checks if the dispatcher exists in the client's queue.
     *
     * @get
     * @returns {boolean} - True if the dispatcher exists, otherwise false.
     */
    get exists() {
        return this.client.queue.has(this.guildId);
    }

    /**
     * Sets the volume for the player.
     *
     * @param {number} [value] - The volume level to set (0-100). If no value is provided, returns the current volume.
     * @returns {number|undefined} - The current volume if no value is provided, otherwise undefined.
     */
    volume(value) {
        if (!value) {
            return this.currentVolume;
        }

        if (isNaN(value) || this.currentVolume === value) return;
        this.player.setGlobalVolume(value);
        this.currentVolume = value;
    }

    /**
     * Plays the next track in the queue.
     *
     * @async
     */
    async play() {
        if (!this.exists || (!this.queue.length && !this.current)) return;
        this.current = this.queue.length !== 0 ? this.queue.shift() : this.queue[0];
        if (!this.current) return;
        this.player.playTrack({ track: { encoded: this.current?.encoded } });
        while (this.history.length > 100) {
            this.history.shift();
        }
    }

    /**
     * Toggles the pause state of the player.
     */
    pause() {
        if (!this.player) return;
        if (!this.paused) {
            this.player.setPaused(true);
            this.paused = true;
            this.client.shoukaku.emit('trackPaused', { player: this.player, track: this.current, dispatcher: this });
        } else {
            this.player.setPaused(false);
            this.paused = false;
            this.client.shoukaku.emit('trackResumed', { player: this.player, track: this.current, dispatcher: this });
        }
    }

    /**
     * Removes a track from the queue at the specified index.
     *
     * @param {number} index - The index of the track to remove.
     */
    remove(index) {
        if (!this.player) return;
        if (index >= this.queue.length) return;
        this.queue.splice(index, 1);
    }

    /**
     * Plays the previous track in the history.
     */
    previousTrack() {
        if (!this.player) return;
        if (!this.previous) return;
        this.queue.unshift(this.current);
        this.queue.unshift(this.previous);
        this.current = this.history.pop() || null;
        this.previous = this.history.pop() || null;
        this.player.stopTrack();
    }

    /**
     * Destroys the dispatcher, clearing the queue and history, and leaving the voice channel.
     */
    destroy() {
        this.queue.length = 0;
        this.history = [];
        this.client.shoukaku.leaveVoiceChannel(this.guildId);
        this.client.queue.delete(this.guildId);
        if (this.stopped) return;
        this.client.shoukaku.emit('playerDestroy', { player: this.player, track: this.current, dispatcher: this });
    }

    /**
     * Sets the shuffle state of the queue.
     *
     * @param {boolean} shuffle - True to enable shuffle, false to disable.
     */
    setShuffle(shuffle) {
        if (!this.player) return;
        this.shuffle = shuffle;

        if (shuffle) {
            this.queue = this.queue.sort(() => Math.random() - 0.5);
        } else {
            this.queue = this.queue.sort((a, b) => a - b);
        }
    }

    /**
     * Skips tracks in the queue.
     *
     * @async
     * @param {number} [skipto=1] - The number of tracks to skip. Defaults to 1.
     */
    async skip(skipto = 1) {
        if (!this.player) return;
        if (skipto > 1) {
            if (skipto > this.queue.length) {
                this.queue.length = 0;
            } else {
                this.queue.splice(0, skipto - 1);
            }
        }

        this.repeat = this.repeat === 1 ? 0 : this.repeat;
        this.player.stopTrack();
    }

    /**
     * Seeks to a specific time in the current track.
     *
     * @param {number} time - The time in milliseconds to seek to.
     */
    seek(time) {
        if (!this.player) return;
        this.player.seekTo(time);
    }

    /**
     * Stops playback and clears the queue and history.
     */
    stop() {
        if (!this.player) return;
        this.queue = new Queue();
        this.history = new History();
        this.loop = 'off';
        this.autoplay = false;
        this.repeat = 0;
        this.stopped = true;
        this.player.stopTrack();
    }

    /**
     * Sets the loop state for the player.
     *
     * @param {string} loop - The loop state ('off', 'repeat', 'queue').
     */
    setLoop(loop) {
        this.loop = loop;
    }

    /**
     * Builds a track object with additional user information.
     *
     * @param {Object} track - The track data to build from.
     * @param {Object} user - The user requesting the track.
     * @returns {Object} - The constructed track object.
     * @throws {AoiError} - Throws an error if the track is not provided.
     */
    buildTrack(track, user) {
        return new Track(track, user);
    }

    /**
     * Checks if a track is currently playing and plays it if not.
     *
     * @async
     */
    async isPlaying() {
        if (this.queue.length && !this.current && !this.player.paused) {
            this.play();
            this.volume(this.client.music.defaultVolume);
        }
    }

    /**
     * Handles autoplay functionality by finding related tracks.
     *
     * @async
     * @param {Object} song - The current song to find related tracks for.
     * @param {string} [type] - The type of search engine to use for finding related tracks.
     */
    async Autoplay(song, type) {
        if (!song) return;
        const resolve = await this.node.rest.resolve(
            `${type || this.autoplayType}:${song?.info?.author || song?.info?.title}`
        );
        if (!resolve || !resolve?.data || !Array.isArray(resolve.data)) return this.stop();
        const metadata = resolve.data;
        let choosed = null;
        const maxAttempts = 10;
        let attempts = 0;
        while (attempts < maxAttempts) {
            const potentialChoice = this.buildTrack(
                metadata[Math.floor(Math.random() * metadata.length)],
                this.current?.info?.requester || this.previous?.info?.requester || this.client.user
            );

            if (
                !this.queue.some(s => s.encoded === potentialChoice.encoded) &&
                !this.history.some(s => s.encoded === potentialChoice.encoded)
            ) {
                choosed = potentialChoice;
                break;
            }
            attempts++;
        }
        if (choosed) {
            this.queue.push(choosed);
            this.isPlaying();
            return;
        }

        if (!this.queue.length) this.stop();
        return;
    }

    /**
     * Sets the autoplay state and optionally the type of search engine.
     *
     * @async
     * @param {boolean} [autoplay=false] - True to enable autoplay, false to disable.
     * @param {string} [type] - The type of search engine to use for autoplay.
     */
    async setAutoplay(autoplay = false, type) {
        this.autoplay = autoplay === true;
        if (type) this.autoplayType = type;
        if (autoplay === true) this.Autoplay(this.current ? this.current : this.queue[0], type || this.autoplayType);
    }

    /**
     * Searches for tracks based on a query and type.
     *
     * @async
     * @param {string} query - The search query for finding tracks.
     * @param {string} [type] - The type of search engine to use.
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
};
