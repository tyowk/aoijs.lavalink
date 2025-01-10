/**
 * @param {import("..").Data} d
 */
module.exports = async d => {
    const data = d.util.aoiFunc(d);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    const player = d.client.queue.get(d.guild.id);
    if (!player) return d.client.returnCode(d, data);

    const msg = player.nowPlaying;
    if (!msg) return d.aoiError.fnError(d, 'custom', {}, `Invalid message, please make sure the message is exists.`);
    if (!msg.deletable || msg.author.id !== d.client.user.id)
        return d.aoiError.fnError(
            d,
            'custom',
            {},
            `Invalid message, please make sure the message is deletable and sended by the bot.`,
        );
    await msg.delete().catch(() => {});

    return {
        code: d.util.setCode(data),
    };
};
