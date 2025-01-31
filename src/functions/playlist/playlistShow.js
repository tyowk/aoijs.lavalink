/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);
    const [
        id = d.author?.id,
        page = 1,
        limit = 10,
        format = '{position}. {name}  |  {length} song(s)',
        separator = '\n'
    ] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    let playlist = d.client.playlist || manager.playlist;
    if (!playlist) return d.aoiError.fnError(d, 'custom', {}, `Playlist manager is not defined.`);

    if (isNaN(Number(page)) || isNaN(Number(limit)))
        return d.aoiError.fnError(d, 'custom', {}, `Please provide a valid number.`);

    playlist = await playlist.show(id).catch(err => {
        return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
    });

    const playlists = playlist?.map((list, index) => {
        const replace = {
            position: (index + 1)?.toLocaleString(),
            name: list.name,
            length: list.length
        };

        return Object.entries(replace).reduce((formatted, [key, value]) => {
            return formatted.replaceAll(`{${key}}`, value);
        }, format);
    });

    let chunks = d.client.music.utils.chunk(playlists, Number(limit));
    if (chunks.length === 0) chunks = [[]];
    if (Number(page) < 1 || Number(page) > chunks.length)
        return d.aoiError.fnError(d, 'custom', {}, `Invalid page number.`);
    let pages = chunks.map(chunk => chunk.join(separator));

    data.result = pages[page - 1];

    return {
        code: d.util.setCode(data)
    };
};
