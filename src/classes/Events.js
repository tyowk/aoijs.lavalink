const { blue, cyan, yellow, red } = require('chalk');
const { AoiError, Track } = require('./Utils.js');

/**
 * Events class to handle various events related to the music player.
 *
 * @class Events
 * @param {Shoukaku} client - The Shoukaku client instance that manages the music player and events.
 */
exports.Events = class Events {
    constructor(client) {
        const log = (...msg) => {
            if (!client?.client?.music?.debug || client?.client?.music?.debug !== true) return;
            console.log(...msg);
        };

        client.on('trackEnd', async ({ player, track, dispatcher }) => {
            await this.trackEnd(player, track, dispatcher);
        });

        client.client.on('raw', async  (d) => {
            await this.voiceState(d, client, client.client);
        });

        if (client?.client?.music?.debug === true) {
            client.on('nodeConnect', ({ name }) => log(`[${blue('DEBUG')}] :: Node "${cyan(name)}" connected`));
            client.on('nodeReconnect', ({ name }) => log(`[${blue('DEBUG')}] :: Node "${yellow(name)}" reconnected`));
            client.on('nodeError', ({ name, error }) => log(`[${blue('DEBUG')}] :: Node "${red(name)}" error:`, error));
            client.on('nodeDestroy', ({ name, code, reason }) =>
                log(`[${blue('DEBUG')}] :: Node "${red(name)}" destroyed with code: ${code}, reason: ${reason}`)
            );
            client.on('nodeDisconnect', ({ name }) => log(`[${blue('DEBUG')}] :: Node "${red(name)}" disconnected`));
            client.on('nodeDebug', ({ name, info }) => log(`[${blue('DEBUG')}] :: "${cyan(name)}" debug: ${info}`));
        }

        client.on('ready', (name, reconnected) => client.emit(reconnected ? 'nodeReconnect' : 'nodeConnect', { name }));
        client.on('reconnecting', (name, left, interval) => client.emit('nodeReconnect', { name, left, interval }));
        client.on('error', (name, error) => client.emit('nodeError', { name, error }));
        client.on('close', (name, code, reason) => client.emit('nodeDestroy', { name, code, reason }));
        client.on('disconnect', (name, count) => client.emit('nodeDisconnect', { name, count }));
        client.on('debug', (name, info) => client.emit('nodeDebug', { name, info }));
        client.on('raw', (name, json) => client.emit('nodeRaw', { name, json }));
    }

    /**
     * Handles the end of a track and manages the playback state.
     *
     * @async
     * @param {Player} player - The player instance that is playing the track.
     * @param {Track} track - The track that has ended.
     * @param {Dispatcher} dispatcher - The dispatcher handling the track playback.
     * @param {Shoukaku} [client=dispatcher.client.shoukaku] - The Shoukaku client instance, defaults to the dispatcher’s client.
     * @throws {AoiError} - Throws an error if the method failed to execute.
     */
    async trackEnd(player, track, dispatcher, client = dispatcher.client.shoukaku) {
        if (!dispatcher || !client) throw new AoiError('Dispatcher is not defined.');

        if (dispatcher.previous) dispatcher.history.push(dispatcher.previous);
        if (dispatcher.loop === 'song' && track instanceof Track) dispatcher.queue.unshift(track);
        else if (dispatcher.loop === 'queue' && track instanceof Track) dispatcher.queue.push(track);
        else track instanceof Track ? (dispatcher.previous = track) : null;

        if (dispatcher.autoplay) await dispatcher.Autoplay(track);
        if (!dispatcher.queue.length) client.emit('queueEnd', { player, track, dispatcher });
        dispatcher.current = null;

        const { maxHistorySize } = dispatcher.client.music;
        while (dispatcher.history.length > maxHistorySize) {
            dispatcher.history.shift();
        }

        await dispatcher.play();
    }

    async voiceState(data, manager, client) {
		if ("t" in data && !["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(data.t)) return;
		const update = "d" in data ? data.d : data;
		if (!update || (!("token" in update) && !("session_id" in update))) return;

		const player = client.queue.get(update.guild_id);
        const connection = manager.connections.get(update.guild_id);
		if (!player) return;
        
		if ("token" in update) {
			const { token, endpoint } = update;
            const { sessionId } = player.node;

			return await player.node.rest.updatePlayer({
				playerOptions: {
                    voice: {
                        token,
                        endpoint,
                        sessionId
                    }
                }
			});
		}

		if (update.user_id !== client.user.id) return;
		if (update.channel_id) {
			if (player.channelId !== update.channel_id) {
				manager.emit('playerMove', player.player, player.current, player);
			}

			player.voiceState.sessionId = update.session_id;
			player.voiceChannelId = update.channel_id;
			return;
		}

		this.emit("playerDisconnect", player, player.voiceChannelId);
		player.voiceChannelId = null;
		player.voiceState = Object.assign({});
		player.destroy();
		return;
	}
}

    
