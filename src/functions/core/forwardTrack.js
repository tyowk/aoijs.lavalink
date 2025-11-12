/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
	const data = d.util.aoiFunc(d);
	let [time = "10s"] = data.inside.splits;

	const manager = d.client.shoukaku;
	if (!manager) return d.aoiError.fnError(d, "custom", {}, "Voice manager is not defined.");

	const player = d.client.queue.get(d.guild?.id);
	if (!player) return d.aoiError.fnError(d, "custom", {}, "There is no player for this guild.");

	if (!player.current) return d.aoiError.fnError(d, "custom", {}, "There is no song currently playing.");
	if (!player.current?.info?.isSeekable || player.current?.info?.isStream)
		return d.aoiError.fnError(d, "custom", {}, "This current track cannot be forwarded.");

	time = d.client.music.utils.parseTime(time?.addBrackets());
	if (!time) return d.aoiError.fnError(d, "custom", {}, "Invalid time format.");

	const currentTime = (player.player.position ?? 0) + 500;
	player.seek(currentTime + time);

	return {
		code: d.util.setCode(data)
	};
};
