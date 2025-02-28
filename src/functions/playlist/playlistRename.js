/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    let [name, newName, id = d.author?.id] = data.inside.splits;
    name = name?.addBrackets();
    newName = newName?.addBrackets();

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const playlist = d.client.playlist || manager.playlist;
    if (!playlist) return d.aoiError.fnError(d, 'custom', {}, `Playlist manager is not defined.`);

    try {
        await playlist.rename(name, id, newName);
    } catch (err) {
        return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
    }

    return {
        code: d.util.setCode(data)
    };
};
