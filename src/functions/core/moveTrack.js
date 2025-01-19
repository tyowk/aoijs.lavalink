/**
 * @param {import("..").Data} d
 */
module.exports = d => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);

    let [fromIndex, toIndex] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, `There is no player for this guild.`);

    if (!player.queue.length) return d.aoiError.fnError(d, 'custom', {}, `There are no songs in the queue.`);

    if (
        isNaN(Number(fromIndex)) ||
        isNaN(Number(toIndex)) ||
        Number(fromIndex) < 1 ||
        Number(toIndex) < 1 ||
        Number(fromIndex) > player.queue.length ||
        Number(toIndex) > player.queue.length
    ) {
        return d.aoiError.fnError(d, 'custom', {}, `Invalid track position. Ensure the positions are valid numbers.`);
    }

    const from = Number(fromIndex) - 1;
    const to = Number(toIndex) - 1;

    const [track] = player.queue.splice(from, 1);
    player.queue.splice(to, 0, track);

    return {
        code: d.util.setCode(data),
    };
};
