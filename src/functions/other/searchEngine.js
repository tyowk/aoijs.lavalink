/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    let [value] = data.inside.splits;
    value = value
        ?.toLowerCase()
        .replace('youtube', 'ytsearch')
        .replace('spotify', 'spsearch')
        .replace('soundcloud', 'scsearch')
        .replace('deezer', 'dzsearch')
        .replace('youtubemusic', 'ytmsearch');

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    if (!value) {
        data.result = d.client.music.searchEngine || 'ytsearch';
    } else {
        if (value && typeof value !== 'string')
            return d.aoiError.fnError(d, 'custom', {}, `The type of value must be a string.`);
        d.client.music.searchEngine = value || 'ytsearch';
    }

    return {
        code: d.util.setCode(data)
    };
};
