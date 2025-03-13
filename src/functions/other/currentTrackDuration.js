/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    const [humanize = 'false'] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, 'There is no player for this guild.');
    if (!player.current) return d.aoiError.fnError(d, 'custom', {}, 'There is no song currently playing.');

    if (humanize === 'false') {
        data.result = player.player.position || 0;
    } else {
        data.result = d.client.music.utils.formatTime(player.player.position || 0) || '0s';
    }

    return {
        code: d.util.setCode(data)
    };
};
