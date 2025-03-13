/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    const [humanize = 'true'] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, 'There is no player for this guild.');
    if (player.queue.length < 1) return d.aoiError.fnError(d, 'custom', {}, 'The queue is currently empty.');

    data.result = player.queue.reduce((x, y) => x + y.info.durationMs || 0, 0);
    if (humanize === 'true') {
        data.result = d.client.music.utils.formatTime(data.result) || '0s';
    }

    return {
        code: d.util.setCode(data)
    };
};
