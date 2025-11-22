/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
	const data = d.util.aoiFunc(d);
	let [name, value] = data.inside.splits;
	value = value?.addBrackets()?.toLowerCase()?.split(".");
	name = name?.addBrackets();

	const manager = d.client.shoukaku;
	if (!manager) return d.aoiError.fnError(d, "custom", {}, "Voice manager is not defined.");

	const node = d.client.shoukaku.nodes.get(name);
	if (!node) return d.aoiError.fnError(d, "custom", {}, `Node ${name} Not Found`);

	let result;
	switch (value[0]) {
		case "cpu": {
			const { cores, systemLoad, lavalinkLoad } = node.stats?.cpu || {};
			if (value[1] === "cores") {
				result = cores;
			} else if (value[1] === "system") {
				result = systemLoad;
			} else if (value[1] === "lavalink") {
				result = lavalinkLoad;
			}
			break;
		}
		case "memory": {
			const { free, used, allocated, reservable } = node.stats?.memory || {};
			if (value[1] === "free") {
				result = free;
			} else if (value[1] === "used") {
				result = used;
			} else if (value[1] === "allocated") {
				result = allocated;
			} else if (value[1] === "reservable") {
				result = reservable;
			}
			break;
		}
		case "player": {
			const { players, playingPlayers } = node.stats || {};
			if (value[1] === "total") {
				result = players;
			} else if (value[1] === "used") {
				result = playingPlayers;
			}
			break;
		}
		case "status": {
			result = node?.state === 1 ? "online" : "offline";
			break;
		}
		case "uptime": {
			result = d.client.music.utils.formatTime(node.stats?.uptime);
			break;
		}
		default: {
			return d.aoiError.fnError(d, "custom", {}, "Invalid stats type.");
		}
	}

	data.result = result;
	return {
		code: d.util.setCode(data)
	};
};
