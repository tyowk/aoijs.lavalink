/**
 * @param {import("..").Data} d
 */
module.exports = d => {
    const data = d.util.aoiFunc(d);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);
    const player = d.client.queue.get(d.guild.id);

    if (!player) {
        data.result = 'destroyed';
    } else if (player?.current && player?.paused === false) {
        data.result = 'playing';
    } else if (player?.current && player?.paused === true) {
        data.result = 'paused';
    } else if (player?.stopped === true) {
        data.result = 'stopped';
    } else {
        data.result = 'destroyed';
    }

    return {
        code: d.util.setCode(data),
    };
};
