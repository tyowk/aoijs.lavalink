/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
	const data = d.util.aoiFunc(d);

	const manager = d.client.shoukaku;
	if (!manager) return d.aoiError.fnError(d, "custom", {}, "Voice manager is not defined.");

	const player = d.client.queue.get(d.guild?.id);

	data.result = player?.history?.length || 0;
	return {
		code: d.util.setCode(data)
	};
};
