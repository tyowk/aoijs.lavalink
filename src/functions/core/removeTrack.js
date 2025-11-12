/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
	const data = d.util.aoiFunc(d);
	if (data.err) return d.error(data.err);
	const [index] = data.inside.splits;

	const manager = d.client.shoukaku;
	if (!manager) return d.aoiError.fnError(d, "custom", {}, "Voice manager is not defined.");

	const player = d.client.queue.get(d.guild?.id);
	if (!player) return d.aoiError.fnError(d, "custom", {}, "There is no player for this guild.");

	if (!player.queue.length) return d.aoiError.fnError(d, "custom", {}, "There is no songs in the queue.");
	if (isNaN(Number(index)) || Number(index) > player.queue.length || Number(index) < 1)
		return d.aoiError.fnError(d, "custom", {}, "Invalid track position. Ensure the positions are valid numbers.");

	player.remove(Number(index) - 1);

	return {
		code: d.util.setCode(data)
	};
};
