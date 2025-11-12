/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
	const data = d.util.aoiFunc(d);
	if (data.err) return d.error(data.err);

	let [name, index, id = d.author?.id] = data.inside.splits;
	name = name?.addBrackets();
	index = Number(index);

	const manager = d.client.shoukaku;
	if (!manager) return d.aoiError.fnError(d, "custom", {}, "Voice manager is not defined.");

	const playlist = d.client.playlist || manager.playlist;
	if (!playlist) return d.aoiError.fnError(d, "custom", {}, "Playlist manager is not defined.");
	data.result = false;

	try {
		const track = await playlist.getTrack(name, id, index);
		data.result = !!track;
	} catch (_err) {
		data.result = false;
	}

	return {
		code: d.util.setCode(data)
	};
};
