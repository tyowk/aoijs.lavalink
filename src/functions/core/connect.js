const { ChannelType } = require('discord.js');

/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    let [voiceId, deaf = 'true', mute = 'false', guildId = d.guild?.id] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    if (!voiceId) voiceId = d.member?.voice?.channel?.id;
    if (!voiceId) return d.aoiError.fnError(d, 'custom', {}, 'You are not connected to any voice channels.');

    const voiceChannel = d.client?.channels?.cache?.get(voiceId) ?? (await d.client?.channels?.fetch(voiceId));
    const guild = d.client?.guilds?.cache?.get(guildId) ?? (await d.client?.guilds?.fetch(guildId));
    if (!voiceChannel) return d.aoiError.fnError(d, 'custom', {}, 'Invalid voice channel id provided.');
    if (!guild) return d.aoiError.fnError(d, 'custom', {}, 'Invalid guild id provided.');

    if (voiceChannel.type !== ChannelType.GuildVoice && voiceChannel.type !== ChannelType.GuildStageVoice)
        return d.aoiError.fnError(
            d,
            'custom',
            {},
            `Invalid channel type: ${ChannelType[voiceChannel.type]}, must be voice or stage channel.`
        );

    let player = d.client.queue.get(guild.id ?? guildId);
    if (player) player.destroy();

    player = await d.client.queue.create(
        d.guild ?? guild,
        voiceChannel,
        d.channel ?? null,
        d.client.shoukaku.getIdealNode(),
        deaf === 'true',
        mute === 'true'
    );

    return {
        code: d.util.setCode(data)
    };
};
