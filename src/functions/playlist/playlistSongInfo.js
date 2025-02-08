/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);

    let [name, type = 'title', index = '1', id = d.author?.id] = data.inside.splits;
    name = name?.addBrackets();
    index = Number(index);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const playlist = d.client.playlist || manager.playlist;
    if (!playlist) return d.aoiError.fnError(d, 'custom', {}, `Playlist manager is not defined.`);

    const getResult = res => {
        if (!res?.info) return null;
        const trackInfo = track.info;
        const requester = trackInfo.requester;
        const pluginInfo = trackInfo.plugininfo;
        const playlistz = trackInfo.playlist;
        
        const trackData = {
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
            albumName: pluginInfo.albumName,
            albumUrl: pluginInfo.albumUrl,
            previewUrl: pluginInfo.previewUrl,
            isPreview: pluginInfo.isPreview,
            artist: trackInfo.artist,
            'artist.avatar': pluginInfo.artistArtworkUrl,
            'artist.url': pluginInfo.artistUrl,
            'playlist.name': playlistz.name,
            'playlist.author': playlistz.author,
            'playlist.thumbnail': playlistz.artworkUrl,
            'playlist.tracks': playlistz.totalTracks,
            'playlist.url': playlistz.url
        };

        return trackData[type];
    };

    if (isNaN(index)) return d.aoiError.fnError(d, 'custom', {}, `Please provide a valid number.`);
    const res = await playlist.getTrack(name, id, index).catch(err => {
        return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
    });

    data.result = getResult(res);

    return {
        code: d.util.setCode(data)
    };
};
