/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, 'There is no player for this guild.');

    if (!player.current) return d.aoiError.fnError(d, 'custom', {}, 'There is no song currently playing.');
    if (player.paused) {
        player.pause();
    } else {
        return d.aoiError.fnError(d, 'custom', {}, 'The player is not paused.');
    }

    return {
        code: d.util.setCode(data)
    };
};
