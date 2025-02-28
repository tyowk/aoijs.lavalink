/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    const [page = 1, limit = 10, format = '{position}. {title} | {requester.username}', separator = '\n'] =
        data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, `There is no player for this guild.`);
    if (!player.history.length) return d.aoiError.fnError(d, 'custom', {}, `There is no songs in the history.`);
    if (isNaN(Number(page)) || isNaN(Number(limit)))
        return d.aoiError.fnError(d, 'custom', {}, `Please provide a valid number.`);

    const history = player.history.map((track, index) => {
        const trackInfo = track.info;
        const requester = trackInfo.requester;
        const pluginInfo = trackInfo.plugininfo;
        const playlist = trackInfo.playlist;

        const replace = {
            position: (index + 1)?.toLocaleString(),
            title: trackInfo.title,
            thumbnail: trackInfo.artworkUrl,
            url: trackInfo.url,
            duration: d.client.music.utils.formatTime(trackInfo.length),
            author: trackInfo.author,
            platform: trackInfo.sourceName,
            identifier: trackInfo.identifier,
            isSeekable: trackInfo.isSeekable,
            isStream: trackInfo.isStream,
            isrc: trackInfo.isrc ?? null,
            durationMs: trackInfo.length ?? 0,
            historyLength: player.history.length ?? 0,
            albumName: pluginInfo.albumName,
            albumUrl: pluginInfo.albumUrl,
            previewUrl: pluginInfo.previewUrl,
            isPreview: pluginInfo.isPreview,
            artist: trackInfo.artist,
            'artist.avatar': pluginInfo.artistArtworkUrl,
            'artist.url': pluginInfo.artistUrl,
            'requester.username': requester.username,
            'requester.globalName': requester.globalName,
            'requester.id': requester.id,
            'requester.avatar': requester.avatar,
            'requester.banner': requester.banner,
            'requester.mention': requester.id ? `<@${requester.id}>` : null,
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

    let chunks = d.client.music.utils.chunk(history, Number(limit));
    if (chunks.length === 0) chunks = [[]];
    if (Number(page) < 1 || Number(page) > chunks.length)
        return d.aoiError.fnError(d, 'custom', {}, `Invalid page number.`);
    const pages = chunks.map((chunk) => chunk.join(separator));

    data.result = pages[page - 1];

    return {
        code: d.util.setCode(data)
    };
};
