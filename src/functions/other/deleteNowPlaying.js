/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player || !player?.nowPlaying || !player?.nowPlaying?.channel || !player?.nowPlaying?.message)
        return d.client.returnCode(d, data);

    const nowPlaying = player.nowPlaying;
    try {
        const channel =
            d.client.channels.cache.get(nowPlaying.channel) ||
            (await d.client.channels.fetch(nowPlaying.channel));

        const msg = channel
            ? channel.messages.cache.get(nowPlaying.message) ||
              (await channel.messages.fetch(nowPlaying.message))
            : null;

        if (!msg || !msg.deletable || msg.author.id !== d.client.user.id) return d.client.returnCode(d, data);

        await msg.delete();
    } catch {}

    if (nowPlaying.message === player.nowPlaying.message)
        player.nowPlaying = null;
    
    return {
        code: d.util.setCode(data),
    };
};
