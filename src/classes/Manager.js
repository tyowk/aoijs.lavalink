const { Shoukaku, Connectors } = require('shoukaku');
const { Queue } = require('./Queue.js');
const { Functions } = require('./Functions.js');
const { Playlist } = require('./Playlist.js');
const { Events } = require('./Events.js');
const { LoadCommands } = require('aoi.js');
const { Utils, Commands, AoiError } = require('./Utils.js');
const { join } = require('node:path');

/**
 * Manager class to handle audio playback and events using Shoukaku.
 *
 * @class Manager
 * @extends Shoukaku
 * @param {Client} client - The discord client instance.
 * @param {Object} [options={}] - Configuration options for the manager.
 * @param {Array} options.nodes - The nodes to connect to for audio playback.
 * @param {boolean} [options.debug=false] - Flag to enable debug logging.
 * @throws {AoiError} - Throws an error if the options is not provided.
 */
exports.Manager = class Manager extends Shoukaku {
    constructor(client, options = {}) {
        if (!client) throw new AoiError('Client instance is not defined.', 'AOI_CLIENT_INVALID');
        if (!options.nodes || !options.nodes.length)
            throw new AoiError('No nodes provided to connect on.', 'AOI_NODES_INVALID');

        options.nodes = Array.isArray(options.nodes) ? options.nodes : [options.nodes];
        options.nodes = options.nodes.map(({ host, port, url, ...nodes }) => ({
            ...nodes,
            url: url && !host && !port ? url : `${host}:${port}`
        }));

        options.maxQueueSize = isNaN(options.maxQueueSize) ? 100 : options.maxQueueSize;
        options.maxPlaylistSize = isNaN(options.maxPlaylistSize) ? 100 : options.maxPlaylistSize;
        options.noLimitVolume = options.noLimitVolume || false;
        options.defaultVolume = isNaN(options.defaultVolume) ? 100 : options.defaultVolume;
        options.maxVolume = isNaN(options.maxVolume) ? 200 : options.maxVolume;
        options.debug = options.debug || false;
        options.searchEngine =
            options.searchEngine
                ?.toLowerCase()
                .replace('youtube', 'ytsearch')
                .replace('spotify', 'spsearch')
                .replace('soundcloud', 'scsearch')
                .replace('deezer', 'dzsearch')
                .replace('applemusic', 'amsearch')
                .replace('youtubemusic', 'ytmsearch') || 'ytsearch';

        super(new Connectors.DiscordJS(client), options.nodes, {
            moveOnDisconnect: options.moveOnDisconnect || false,
            resume: options.resume || false,
            resumeByLibrary: options.resumeByLibrary || false,
            resumeTimeout: options.resumeTimeout || 30,
            reconnectInterval: options.reconnectInterval || 5,
            reconnectTries: options.reconnectTries || 3,
            restTimeout: options.restTimeout || 60,
            userAgent: options.userAgent === '(auto)' ? 'aoijs.lavalink' : options.userAgent,
            voiceConnectionTimeout: options.voiceConnectionTimeout || 15,
            structures: options.structures || {},
            nodeResolver: nodes => {
                return [...nodes.values()]
                    .filter(node => node.state === 2)
                    .sort((a, b) => a.penalties - b.penalties)
                    .shift();
            }
        });

        this.cmd = new Commands();
        this.client = client;
        this.client.shoukaku = this;
        this.client.queue = new Queue(this.client, options);
        this.client.loadVoiceEvents = this.loadVoiceEvents.bind(this);
        this.client.voiceEvent = this.voiceEvent.bind(this);
        this.client.music = {
            ...options,
            utils: Utils,
            cmd: this.cmd
        };

        if (options.playlist && typeof options.playlist === 'object') {
            this.playlist = new Playlist(this, options.playlist);
        }

        new Functions(this.client, join(__dirname, '..', 'functions'), options.debug);
        new Events(this);
        Object.keys(this.cmd).forEach(event => this.#bindEvents(event));
    }

    /**
     * Binds player events to their respective handlers.
     *
     * @param {string} event - The name of the event to bind.
     */
    #bindEvents(event) {
        this.on(event, async ({ player, track, dispatcher, ...nodeEvent }) => {
            const commands = this.cmd[event];
            if (!commands) return;

            for (const cmd of commands.values()) {
                if (!cmd) continue;
                let guild = this.client.guilds.cache.get(player?.guildId);
                const member = guild?.members?.cache?.get(track?.info?.requester?.id);
                const author = member?.user || this.client.users.cache.get(track?.info?.requester?.id);
                let channel =
                    this.client.channels.cache.get(cmd?.channel) ||
                    this.client.channels.cache.get(dispatcher?.channelId);

                if (cmd.channel?.includes('$')) {
                    channel = this.client.channels.cache.get(
                        (
                            await this.client.functionManager.interpreter(
                                this.client,
                                { guild, channel, member, author },
                                [],
                                { code: cmd.channel, name: 'NameParser' },
                                undefined,
                                true,
                                undefined,
                                {}
                            )
                        )?.code
                    );
                }

                if (!channel) channel = this.client.channels.cache.get(dispatcher?.channelId);
                if (!guild && channel) guild = channel.guild;

                await this.client.functionManager.interpreter(
                    this.client,
                    { guild, channel, member, author },
                    [],
                    cmd,
                    undefined,
                    false,
                    channel,
                    { player, track, dispatcher, nodeEvent }
                );
            }
        });
    }

    /**
     * Loads voice events from a specified directory.
     *
     * @param {string} dir - The directory to load commands from.
     * @param {boolean} [debug=this.client.music.debug] - Flag to enable debug logging.
     * @returns {Manager} - The current instance of the Manager.
     */
    loadVoiceEvents(dir, debug = this.client.music.debug || false) {
        if (!this.client.loader) this.client.loader = new LoadCommands(this.client);
        this.client.loader.load(this.cmd, dir, debug);
        return this;
    }

    /**
     * Handles voice events by setting the command for the specified event.
     *
     * @param {string} name - The name of the event.
     * @param {Object} [evt={}] - The event data.
     * @returns {Manager} - The current instance of the Manager.
     */
    voiceEvent(name, evt = {}) {
        if (!evt || !evt.code) return;
        const cmd = this.cmd[name];
        if (!cmd) return;
        cmd.set(cmd.size, evt);
        return this;
    }

    trackStart(cmd) {
        this.voiceEvent('trackStart', cmd);
        return this;
    }

    trackEnd(cmd) {
        this.voiceEvent('trackEnd', cmd);
        return this;
    }

    queueStart(cmd) {
        this.voiceEvent('queueStart', cmd);
        return this;
    }

    queueEnd(cmd) {
        this.voiceEvent('queueEnd', cmd);
        return this;
    }

    trackStuck(cmd) {
        this.voiceEvent('trackStuck', cmd);
        return this;
    }

    trackPaused(cmd) {
        this.voiceEvent('trackPaused', cmd);
        return this;
    }

    trackResumed(cmd) {
        this.voiceEvent('trackResumed', cmd);
        return this;
    }

    nodeConnect(cmd) {
        this.voiceEvent('nodeConnect', cmd);
        return this;
    }

    nodeReconnect(cmd) {
        this.voiceEvent('nodeReconnect', cmd);
        return this;
    }

    nodeDisconnect(cmd) {
        this.voiceEvent('nodeDisconnect', cmd);
        return this;
    }

    nodeError(cmd) {
        this.voiceEvent('nodeError', cmd);
        return this;
    }

    nodeDestroy(cmd) {
        this.voiceEvent('nodeDestroy', cmd);
        return this;
    }

    socketClosed(cmd) {
        this.voiceEvent('socketClosed', cmd);
        return this;
    }

    playerCreate(cmd) {
        this.voiceEvent('playerCreate', cmd);
        return this;
    }

    playerDestroy(cmd) {
        this.voiceEvent('playerDestroy', cmd);
        return this;
    }

    playerException(cmd) {
        this.voiceEvent('playerException', cmd);
        return this;
    }

    playerUpdate(cmd) {
        this.voiceEvent('playerUpdate', cmd);
        return this;
    }

    nodeDebug(cmd) {
        this.voiceEvent('nodeDebug', cmd);
        return this;
    }
};
