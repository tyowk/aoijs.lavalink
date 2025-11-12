/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
	const data = d.util.aoiFunc(d);
	let [value, type] = data.inside.splits;
	type = type
		?.toLowerCase()
		.replace("youtube", "ytsearch")
		.replace("spotify", "spsearch")
		.replace("soundcloud", "scsearch")
		.replace("deezer", "dzsearch")
		.replace("youtubemusic", "ytmsearch")
		.replace("applemusic", "amsearch");

	const manager = d.client.shoukaku;
	if (!manager) return d.aoiError.fnError(d, "custom", {}, "Voice manager is not defined.");

	const player = d.client.queue.get(d.guild?.id);
	if (!player) return d.aoiError.fnError(d, "custom", {}, "There is no player for this guild.");

	if (!value) {
		data.result = player.autoplay || false;
	} else {
		if (!player.current) return d.aoiError.fnError(d, "custom", {}, "There is no song currently playing.");
		await player.setAutoplay(value === "true", type || d.client.music.searchEngine);
	}

	return {
		code: d.util.setCode(data)
	};
};
