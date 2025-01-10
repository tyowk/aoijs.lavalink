/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    let [name, id = d.author?.id, page = 1, limit = 10, format = '{position}. {title}', separator = '\n'] =
        data.inside.splits;
    name = name?.addBrackets();

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    let playlist = d.client.playlist || manager.playlist;
    if (!playlist) return d.aoiError.fnError(d, 'custom', {}, `Playlist manager is not defined.`);

    if (isNaN(Number(page)) || isNaN(Number(limit)))
        return d.aoiError.fnError(d, 'custom', {}, `Please provide a valid number.`);

    playlist = await playlist.get(name, id).catch(err => {
        return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
    });

    const tracks = playlist?.map((track, index) => {
        const trackInfo = track.info;
        const requester = trackInfo?.requester;
        const pluginInfo = trackInfo?.plugininfo;
        const replace = {
            position: (index + 1)?.toLocaleString(),
            title: trackInfo.title,
            artworkUrl: trackInfo.artworkUrl,
            artwork: trackInfo.artworkUrl,
            thumbnail: trackInfo.artworkUrl,
            url: trackInfo.url,
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
            artist: trackInfo.artist,
            'artist.artworkUrl': pluginInfo?.artistArtworkUrl,
            'artist.url': pluginInfo?.artistUrl,
        };

        return Object.entries(replace).reduce((formatted, [key, value]) => {
            return formatted.replaceAll(`{${key}}`, value);
        }, format);
    });

    let chunks = d.client.music.utils.chunk(tracks, Number(limit));
    if (chunks.length === 0) chunks = [[]];
    if (Number(page) < 1 || Number(page) > chunks.length)
        return d.aoiError.fnError(d, 'custom', {}, `Invalid page number.`);
    let pages = chunks.map(chunk => chunk.join(separator));

    data.result = pages[page - 1];

    return {
        code: d.util.setCode(data),
    };
};
