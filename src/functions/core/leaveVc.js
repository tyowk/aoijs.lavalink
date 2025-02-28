/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    const [guildId] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(guildId ? guildId : d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, `There is no player for this guild.`);

    player.destroy();

    return {
        code: d.util.setCode(data)
    };
};
