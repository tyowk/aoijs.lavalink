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

    try {
        const channel =
            d.client.channels.cache.get(player.nowPlaying.channel) ||
            (await d.client.channels.fetch(player.nowPlaying.channel));

        const msg = channel
            ? channel.messages.cache.get(player.nowPlaying.message) ||
              (await channel.messages.fetch(player.nowPlaying.message))
            : null;

        if (!msg || !msg.deletable || msg.author.id !== d.client.user.id) return d.client.returnCode(d, data);

        await msg.delete();
    } catch {}

    player.nowPlaying = null;
    return {
        code: d.util.setCode(data),
    };
};
