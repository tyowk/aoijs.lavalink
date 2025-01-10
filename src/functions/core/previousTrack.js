/**
 * @param {import("..").Data} d
 */
module.exports = d => {
    const data = d.util.aoiFunc(d);
    const player = d.client.queue.get(d.guild.id);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    if (!player) return d.aoiError.fnError(d, 'custom', {}, `There is no player for this guild.`);
    if (!player.previous) return d.aoiError.fnError(d, 'custom', {}, `There is no previous track.`);

    player.previousTrack();

    return {
        code: d.util.setCode(data),
    };
};
