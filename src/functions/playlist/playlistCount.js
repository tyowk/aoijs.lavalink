/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
	const data = d.util.aoiFunc(d);
	const [id = d.author?.id] = data.inside.splits;

	const manager = d.client.shoukaku;
	if (!manager) return d.aoiError.fnError(d, "custom", {}, "Voice manager is not defined.");

	const playlist = d.client.playlist || manager.playlist;
	if (!playlist) return d.aoiError.fnError(d, "custom", {}, "Playlist manager is not defined.");

	try {
		const result = await playlist.count(id);
		data.result = result;
	} catch (err) {
		return d.aoiError.fnError(d, "custom", {}, `${err.message}`);
	}

	return {
		code: d.util.setCode(data)
	};
};
