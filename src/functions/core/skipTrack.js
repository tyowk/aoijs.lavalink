/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, `There is no player for this guild.`);

    player.skip();

    return {
        code: d.util.setCode(data)
    };
};
