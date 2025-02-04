/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    const [messageId] = data.inside.splits;
    if (!messageId) return d.aoiError.fnError(d, 'custom', {}, `Please give a valid message id.`);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, `There is no player for this guild.`);

    player.nowPlaying = {
        message: messageId,
        channel: player.channelId || d.channel.id,
        isDeleted: false,
        last: {
            message: player.nowPlaying?.message ? player.nowPlaying?.message : null,
            channel: player.nowPlaying?.channel ? player.nowPlaying?.channel : null
        }
    };

    return {
        code: d.util.setCode(data)
    };
};
