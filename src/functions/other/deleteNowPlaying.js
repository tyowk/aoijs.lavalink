const { setTimeout: Timeout } = require('timers/promises');

/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);

    const { deleteNowPlaying } = d.client.music;
    if (deleteNowPlaying) return d.client.returnCode(d, data);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player || !player?.nowPlaying || !player?.nowPlaying?.channel || !player?.nowPlaying?.message)
        return d.client.returnCode(d, data);

    let nowPlaying = player.nowPlaying;
    if (!nowPlaying) return d.client.returnCode(d, data);
    let maxAttempt = 20;

    while (maxAttempt > 0 && nowPlaying.isDeleted) {
        await Timeout(1000);
        nowPlaying = player.nowPlaying;
        maxAttempt--;
    }

    try {
        const channel = d.client.channels.cache.get(nowPlaying.channel) || await d.client.channels.fetch(nowPlaying.channel);
        if (!channel) return d.client.returnCode(d, data);

        const msg = channel.messages.cache.get(nowPlaying.message) || await channel.messages.fetch(nowPlaying.message);
        if (!msg || !msg.deletable || msg.author.id !== d.client.user.id) return d.client.returnCode(d, data);

        await msg.delete();
    } catch {};

    if (!player.nowPlaying.isDeleted && player.nowPlaying.message === nowPlaying.message) {
        player.nowPlaying.isDeleted = true;
    }

    return {
        code: d.util.setCode(data)
    };
};
