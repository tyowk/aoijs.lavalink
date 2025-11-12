/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
	const data = d.util.aoiFunc(d);
	const [state, guildId] = data.inside.splits;

	const manager = d.client.shoukaku;
	if (!manager) return d.aoiError.fnError(d, "custom", {}, "Voice manager is not defined.");

	if (!state || state === "" || (state !== "true" && state !== "false"))
		return d.aoiError.fnError(d, "custom", {}, "Invalid mute state provided. must be boolean!");

	const player = d.client.queue.get(guildId ? guildId : d.guild?.id);
	const connection = manager.connections.get(guildId ? guildId : d.guild?.id);
	if (!player || !connection) return d.aoiError.fnError(d, "custom", {}, "There is no player for this guild.");

	connection.setMute(state === "true");

	return {
		code: d.util.setCode(data)
	};
};
