const { LoadType } = require('shoukaku');

/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    let [
        query,
        type = d.client.music.searchEngine,
        format = '{position}. {title} | {artist}',
        limit = 10,
        separator = '\n',
        page = 1
    ] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);
    if (!query) return d.aoiError.fnError(d, 'custom', {}, `Please provide the title of the song you want to search.`);
    type = type
        ?.toLowerCase()
        .replace('youtube', 'ytsearch')
        .replace('spotify', 'spsearch')
        .replace('soundcloud', 'scsearch')
        .replace('deezer', 'dzsearch')
        .replace('youtubemusic', 'ytmsearch')
        .replace('applemusic', 'amsearch');

    const res =
        d.data.tracks && d.data.tracks?.query === query?.addBrackets()
            ? d.data.tracks
            : await d.client.queue.search(query?.addBrackets(), type);

    d.data.tracks = res || null;
    if (d.data.tracks && typeof d.data.tracks === 'object') d.data.tracks.query = query?.addBrackets();

    switch (res?.loadType) {
        case LoadType.ERROR: {
            return d.aoiError.fnError(d, 'custom', {}, `There was an error while searching.`);
        }

        case LoadType.EMPTY: {
            return d.aoiError.fnError(d, 'custom', {}, `There were no results found.`);
        }

        case LoadType.TRACK: {
            if (!res.data || typeof res.data !== 'object') {
                return d.aoiError.fnError(d, 'custom', {}, `There were no results found.`);
            }

            const trackInfo = res.data.info ?? {};
            const pluginInfo = res.data.pluginInfo ?? {};
            const replace = {
                position: 1,
                title: trackInfo.title,
                thumbnail: trackInfo.artworkUrl,
                url: trackInfo.uri,
                duration: d.client.music.utils.formatTime(trackInfo.length),
                author: trackInfo.author,
                platform: trackInfo.sourceName,
                identifier: trackInfo.identifier,
                isSeekable: trackInfo.isSeekable,
                isStream: trackInfo.isStream,
                isrc: trackInfo.isrc,
                durationMs: trackInfo.length ?? 0,
                albumName: pluginInfo.albumName,
                albumUrl: pluginInfo.albumUrl,
                previewUrl: pluginInfo.previewUrl,
                isPreview: pluginInfo.isPreview,
                artist: trackInfo.author,
                'artist.avatar': pluginInfo.artistArtworkUrl,
                'artist.url': pluginInfo.artistUrl
            };

            data.result = Object.entries(replace).reduce((formatted, [key, value]) => {
                return formatted.replaceAll(`{${key}}`, value ?? '');
            }, format);
            break;
        }

        case LoadType.PLAYLIST: {
            if (!Array.isArray(res.data.tracks) || res.data.tracks.length === 0) {
                return d.aoiError.fnError(d, 'custom', {}, `There were no results found.`);
            }

            const playlist = {
                ...(res.data.info ?? {}),
                ...(res.data.pluginInfo ?? {})
            };

            const result = res.data.tracks.map((track, index) => {
                const trackInfo = track.info ?? {};
                const pluginInfo = track.pluginInfo ?? {};
                const replace = {
                    position: (index + 1)?.toLocaleString(),
                    title: trackInfo.title,
                    thumbnail: trackInfo.artworkUrl,
                    url: trackInfo.uri,
                    duration: d.client.music.utils.formatTime(trackInfo.length),
                    author: trackInfo.author,
                    platform: trackInfo.sourceName,
                    identifier: trackInfo.identifier,
                    isSeekable: trackInfo.isSeekable,
                    isStream: trackInfo.isStream,
                    isrc: trackInfo.isrc,
                    durationMs: trackInfo.length ?? 0,
                    albumName: pluginInfo.albumName,
                    albumUrl: pluginInfo.albumUrl,
                    previewUrl: pluginInfo.previewUrl,
                    isPreview: pluginInfo.isPreview,
                    artist: trackInfo.author,
                    'artist.avatar': pluginInfo.artistArtworkUrl,
                    'artist.url': pluginInfo.artistUrl,
                    'playlist.name': playlist.name,
                    'playlist.author': playlist.author,
                    'playlist.thumbnail': playlist.artworkUrl,
                    'playlist.tracks': playlist.totalTracks,
                    'playlist.url': playlist.url
                };

                return Object.entries(replace).reduce((formatted, [key, value]) => {
                    return formatted.replaceAll(`{${key}}`, value ?? '');
                }, format);
            });

            let chunks = d.client.music.utils.chunk(result, Number(limit));
            if (chunks.length === 0) chunks = [[]];
            const pages = chunks.map((chunk) => chunk.join(separator));

            data.result = pages[page - 1];
            break;
        }

        case LoadType.SEARCH: {
            if (!Array.isArray(res.data) || res.data.length === 0) {
                return d.aoiError.fnError(d, 'custom', {}, `There were no results found.`);
            }

            const result = res.data.map((track, index) => {
                const trackInfo = track.info ?? {};
                const pluginInfo = track.pluginInfo ?? {};
                const replace = {
                    position: (index + 1)?.toLocaleString(),
                    title: trackInfo.title,
                    thumbnail: trackInfo.artworkUrl,
                    url: trackInfo.uri,
                    duration: d.client.music.utils.formatTime(trackInfo.length),
                    author: trackInfo.author,
                    platform: trackInfo.sourceName,
                    identifier: trackInfo.identifier,
                    isSeekable: trackInfo.isSeekable,
                    isStream: trackInfo.isStream,
                    isrc: trackInfo.isrc,
                    durationMs: trackInfo.length ?? 0,
                    albumName: pluginInfo.albumName,
                    albumUrl: pluginInfo.albumUrl,
                    previewUrl: pluginInfo.previewUrl,
                    isPreview: pluginInfo.isPreview,
                    artist: trackInfo.author,
                    'artist.avatar': pluginInfo.artistArtworkUrl,
                    'artist.url': pluginInfo.artistUrl
                };

                return Object.entries(replace).reduce((formatted, [key, value]) => {
                    return formatted.replaceAll(`{${key}}`, value ?? '');
                }, format);
            });

            let chunks = d.client.music.utils.chunk(result, Number(limit));
            if (chunks.length === 0) chunks = [[]];
            const pages = chunks.map((chunk) => chunk.join(separator));

            data.result = pages[page - 1];
            break;
        }
    }

    return {
        code: d.util.setCode(data)
    };
};
