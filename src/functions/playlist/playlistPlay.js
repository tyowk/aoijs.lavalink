/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    let [name, index, id = d.author?.id] = data.inside.splits;
    index = Number(index);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const playlist = d.client.playlist || manager.playlist;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Playlist manager is not defined.`);

    if (!d.member?.voice?.channel)
        return d.aoiError.fnError(d, 'custom', {}, `You are not connected to any voice channels.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, `There is no player for this guild.`);
    if (player.channelId !== d.channel?.id && d.channel?.id) player.channelId = d.channel.id;
    const { maxQueueSize, maxPlaylistSize } = d.client.music;

    if (!isNaN(index)) {
        if (player.queue.length >= maxQueueSize)
            return d.aoiError.fnError(d, 'custom', {}, `The maximum queue load size is reached: ${maxQueueSize}`);

        const track = await playlist.getTrack(name, id, index).catch(err => {
            return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
        });

        player.queue.push(track);
        player.isPlaying();
    } else {
        const tracks = await playlist.get(name, id).catch(err => {
            return d.aoiError.fnError(d, 'custom', {}, `${err.message}`);
        });

        if (tracks.length > maxPlaylistSize)
            return d.aoiError.fnError(d, 'custom', {}, `The maximum playlist load size is reached: ${maxPlaylistSize}`);

        for (const track of tracks) {
            if (player.queue.length >= maxQueueSize) break;
            player.queue.push(track);
        }

        player.isPlaying();
    }

    while (player.queue.length > maxQueueSize) {
        player.queue.pop();
    }

    return {
        code: d.util.setCode(data)
    };
};
