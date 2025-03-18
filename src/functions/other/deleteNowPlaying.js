/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);

    const { deleteNowPlaying } = d.client.music;
    if (deleteNowPlaying) return d.client.returnCode(d, data);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    const player = d.client.queue.get(d.guild?.id);
    if (!player) return d.client.returnCode(d, data);

    await player.deleteNowPlaying();

    return {
        code: d.util.setCode(data)
    };
};
