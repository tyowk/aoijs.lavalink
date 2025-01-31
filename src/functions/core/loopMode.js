/**
 * @param {import("..").Data} d
 */
module.exports = d => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    const [value] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, `There is no player for this guild.`);

    switch (value?.addBrackets()) {
        case 'song':
            player.loop = 'song';
            break;
        case 'repeat':
            player.loop = 'song';
            break;
        case 'queue':
            player.loop = 'queue';
            break;
        case 'off':
            player.loop = 'off';
            break;
        case 'disable':
            player.loop = 'off';
            break;
        case 'none':
            player.loop = 'off';
            break;
        default:
            return d.aoiError.fnError(d, 'custom', {}, `Invalid loop mode value.`);
    }

    return {
        code: d.util.setCode(data)
    };
};
