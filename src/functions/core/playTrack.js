const { LoadType } = require('shoukaku');

/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    let [query, type = d.client.music.searchEngine, debug = 'false'] = data.inside.splits;
    const manager = d.client.shoukaku;

    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);
    if (!query)
        return d.aoiError.fnError(d, 'custom', {}, `Please provide the title or link of the song you want to play.`);
    if (!type) type = d.client.music.searchEngine;

    type = type
        ?.toLowerCase()
        .replace('youtube', 'ytsearch')
        .replace('spotify', 'spsearch')
        .replace('soundcloud', 'scsearch')
        .replace('deezer', 'dzsearch')
        .replace('youtubemusic', 'ytmsearch')
        .replace('applemusic', 'amsearch');

    if (!d.member?.voice?.channel)
        return d.aoiError.fnError(d, 'custom', {}, `You are not connected to any voice channels.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, `There is no player for this guild.`);
    if (player.channelId !== d.channel?.id && d.channel?.id) player.channelId = d.channel.id;

    let debugResult;
    const res =
        d.data.tracks && d.data.tracks?.query === query?.addBrackets()
            ? d.data.tracks
            : await d.client.queue.search(query?.addBrackets(), type);

    d.data.tracks = res || null;
    if (d.data.tracks && typeof d.data.tracks === 'object') d.data.tracks.query = query?.addBrackets();
    const { maxQueueSize, maxPlaylistSize } = d.client.music;

    switch (res?.loadType) {
        case LoadType.TRACK: {
            if (player.queue.length >= maxQueueSize) {
                return d.aoiError.fnError(d, 'custom', {}, `The maximum queue load size is reached: ${maxQueueSize}`);
            }

            debugResult = 'track';
            const track = player.buildTrack(res.data, d.author);
            player.queue.push(track);
            player.isPlaying();
            break;
        }
        case LoadType.PLAYLIST: {
            if (res.data.tracks.length > maxPlaylistSize) {
                return d.aoiError.fnError(
                    d,
                    'custom',
                    {},
                    `The maximum playlist load size is reached: ${maxPlaylistSize}`
                );
            }

            for (const track of res.data.tracks) {
                if (player.queue.length >= maxQueueSize) break;
                const playlist = player.buildTrack(track, d.author, {
                    ...(res.data.info ?? {}),
                    ...(res.data.pluginInfo ?? {})
                });

                player.queue.push(playlist);
            }

            debugResult = 'playlist';
            player.isPlaying();
            break;
        }
        case LoadType.SEARCH: {
            if (player.queue.length >= maxQueueSize) {
                return d.aoiError.fnError(d, 'custom', {}, `The maximum queue load size is reached: ${maxQueueSize}`);
            }

            const track = player.buildTrack(res.data[0], d.author);
            player.queue.push(track);
            debugResult = 'search';
            player.isPlaying();
            break;
        }
        case LoadType.EMPTY: {
            debugResult = 'empty';
            break;
        }
        default: {
            debugResult = 'error';
        }
    }

    while (player.queue.length > maxQueueSize) {
        player.queue.pop();
    }

    if (debug === 'true') data.result = debugResult;

    return {
        code: d.util.setCode(data)
    };
};
