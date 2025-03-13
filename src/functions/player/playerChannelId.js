/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    const [channelId] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.client.returnCode(d, data);

    const channel = d.client.channels.cache.get(d, channelId);
    if (channel && channel?.id === channelId) {
        player.channelId = channel.id;
    } else {
        data.result = player?.channelId;
    }

    return {
        code: d.util.setCode(data)
    };
};
