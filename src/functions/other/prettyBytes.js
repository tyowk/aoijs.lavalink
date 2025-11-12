/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
	const data = d.util.aoiFunc(d);
	let [bytes] = data.inside.splits;
	bytes = Number(bytes);

	if (!bytes) return d.aoiError.fnError(d, "custom", {}, "Please give a valid number");
	if (typeof bytes !== "number" || isNaN(bytes))
		return d.aoiError.fnError(d, "custom", {}, "Please give a valid number");

	if (bytes <= 0) {
		data.result = "0 B";
	} else {
		const UNITS = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
		const exponent = Math.floor(Math.log10(bytes) / 3);
		const value = bytes / 1000 ** exponent;
		data.result = `${value.toFixed(2)} ${UNITS[exponent]}`;
	}

	return {
		code: d.util.setCode(data)
	};
};
