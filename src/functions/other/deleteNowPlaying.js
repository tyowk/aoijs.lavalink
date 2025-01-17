/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.client.returnCode(d, data);

    try {
        const channel = await d.util.getChannel(d, player.nowPlaying.channel);
        const msg = await d.util.getMessage(channel, player.nowPlaying.message);
        if (!msg || !msg.deletable || msg.author.id !== d.client.user.id) return d.client.returnCode(d, data);

        await msg.delete();
    } catch {}
    return {
        code: d.util.setCode(data),
    };
};
