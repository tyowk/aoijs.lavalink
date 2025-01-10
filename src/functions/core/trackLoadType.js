const { LoadType } = require('shoukaku');

/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    let [query, type] = data.inside.splits;

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

    const res =
        d.data.tracks && d.data.tracks?.query === query.addBrackets()
            ? d.data.tracks
            : await d.client.queue.search(query?.addBrackets(), type);

    d.data.tracks = res || null;
    if (d.data.tracks && typeof d.data.tracks === 'object') d.data.tracks.query = query?.addBrackets();

    switch (res?.loadType) {
        case LoadType.TRACK:
            data.result = 'track';
            break;
        case LoadType.PLAYLIST:
            data.result = 'playlist';
            break;
        case LoadType.SEARCH:
            data.result = 'search';
            break;
        case LoadType.EMPTY:
            data.result = 'empty';
            break;
        case LoadType.ERROR:
            data.result = 'error';
            break;
        default:
            data.result = 'error';
    }

    return {
        code: d.util.setCode(data),
    };
};
