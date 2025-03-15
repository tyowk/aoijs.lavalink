/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    const [guildId = d.guild?.id] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    if (!guildId || guildId === '') return d.aoiError.fnError(d, 'custom', {}, 'Invalid guild id provided.');

    const player = d.client.queue.get(guildId);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, 'There is no player for this guild.');

    player.destroy();

    return {
        code: d.util.setCode(data)
    };
};
