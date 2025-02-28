/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    let [value] = data.inside.splits;
    value = Number(value);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const playlist = d.client.playlist || manager.playlist;
    if (!playlist) return d.aoiError.fnError(d, 'custom', {}, `Playlist manager is not defined.`);

    if (isNaN(value)) {
        data.result = playlist?.maxSongs || 20;
    } else {
        playlist.maxSongs = Number(value);
    }

    return {
        code: d.util.setCode(data)
    };
};
