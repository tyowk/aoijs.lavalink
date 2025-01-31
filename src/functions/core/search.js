const { LoadType } = require('shoukaku');

/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
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
            d.aoiError.fnError(d, 'custom', {}, `There was an error while searching.`);
            break;
        }
        case LoadType.EMPTY: {
            d.aoiError.fnError(d, 'custom', {}, `There were no results found.`);
            break;
        }
        case LoadType.SEARCH: {
            if (!Array.isArray(res.data) || res.data.length === 0)
                return d.aoiError.fnError(d, 'custom', {}, `There were no results found.`);

            const result = res.data.map((track, index) => {
                const trackInfo = track.info;
                const pluginInfo = track.pluginInfo;
                const replace = {
                    position: (index + 1)?.toLocaleString(),
                    title: trackInfo.title,
                    artworkUrl: trackInfo.artworkUrl,
                    artwork: trackInfo.artworkUrl,
                    thumbnail: trackInfo.artworkUrl,
                    url: trackInfo.uri,
                    uri: trackInfo.uri,
                    duration: d.client.music.utils.formatTime(trackInfo.length),
                    author: trackInfo.author,
                    sourceName: trackInfo.sourceName,
                    source: trackInfo.sourceName,
                    platform: trackInfo.sourceName,
                    identifier: trackInfo.identifier,
                    isSeekable: trackInfo.isSeekable,
                    isStream: trackInfo.isStream,
                    isrc: trackInfo.isrc || 'N/A',
                    durationMs: trackInfo.length || 'N/A',
                    albumName: pluginInfo?.albumName,
                    albumUrl: pluginInfo?.albumUrl,
                    previewUrl: pluginInfo?.previewUrl,
                    isPreview: pluginInfo?.isPreview,
                    artist: trackInfo.author,
                    'artist.artworkUrl': pluginInfo?.artistArtworkUrl,
                    'artist.url': pluginInfo?.artistUrl
                };

                return Object.entries(replace).reduce((formatted, [key, value]) => {
                    return formatted.replaceAll(`{${key}}`, value);
                }, format);
            });

            let chunks = d.client.music.utils.chunk(result, Number(limit));
            if (chunks.length === 0) chunks = [[]];
            let pages = chunks.map(chunk => chunk.join(separator));

            data.result = pages[page - 1];
            break;
        }
    }

    return {
        code: d.util.setCode(data)
    };
};
