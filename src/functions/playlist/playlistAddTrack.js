const { LoadType } = require('shoukaku');
const { Track } = require('../../classes/Utils.js');

/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    let [name, query, type = d.client.music.searchEngine, id = d.author?.id, debug = 'false'] = data.inside.splits;
    name = name?.addBrackets();
    const manager = d.client.shoukaku;
    const playlist = d.client.playlist || manager?.playlist;

    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');
    if (!playlist) return d.aoiError.fnError(d, 'custom', {}, 'Playlist manager is not defined.');
    if (!name) return d.aoiError.fnError(d, 'custom', {}, 'Playlist name is required.');
    if (!query) return d.aoiError.fnError(d, 'custom', {}, 'Please provide the title or link of the song.');
    if (!type) type = d.client.music.searchEngine;

    type = type
        ?.toLowerCase()
        .replace('youtube', 'ytsearch')
        .replace('spotify', 'spsearch')
        .replace('soundcloud', 'scsearch')
        .replace('deezer', 'dzsearch')
        .replace('youtubemusic', 'ytmsearch')
        .replace('applemusic', 'amsearch');

    let debugResult;
    const res =
        d.data.tracks && d.data.tracks?.query === query?.addBrackets()
            ? d.data.tracks
            : await d.client.queue.search(query?.addBrackets(), type);

    d.data.tracks = res || null;
    if (d.data.tracks && typeof d.data.tracks === 'object') d.data.tracks.query = query?.addBrackets();

    const maxSongs = Number(playlist.maxSongs) || 20;
    let playlistLength = await playlist.length(name, id).catch((err) => {
        return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
    });

    switch (res?.loadType) {
        case LoadType.TRACK: {
            if (playlistLength >= maxSongs) {
                d.aoiError.fnError(d, 'custom', {}, `The maximum tracks limit is reached: ${maxSongs}`);
                break;
            }

            const track = new Track(res.data, d.author);
            await playlist.addTrack(name, id, track).catch((err) => {
                return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
            });

            debugResult = 'track';
            break;
        }
        case LoadType.PLAYLIST: {
            if (playlistLength >= maxSongs) {
                d.aoiError.fnError(d, 'custom', {}, `The maximum tracks limit is reached: ${maxSongs}`);
                break;
            }

            const tracks = await playlist.get(name, id).catch((err) => {
                return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
            });

            for (const track of res.data.tracks) {
                if (playlistLength >= maxSongs) break;
                tracks.push(
                    new Track(track, d.author, {
                        ...(res.data.info ?? {}),
                        ...(res.data.pluginInfo ?? {})
                    })
                );

                playlistLength++;
            }

            await playlist.update(name, id, tracks).catch((err) => {
                return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
            });

            debugResult = 'playlist';
            break;
        }
        case LoadType.SEARCH: {
            if (playlistLength >= maxSongs) {
                d.aoiError.fnError(d, 'custom', {}, `The maximum tracks limit is reached: ${maxSongs}`);
                break;
            }

            const track = new Track(res.data[0], d.author);
            await playlist.addTrack(name, id, track).catch((err) => {
                return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
            });

            debugResult = 'search';
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

    if (debug === 'true') data.result = debugResult;

    return {
        code: d.util.setCode(data)
    };
};
