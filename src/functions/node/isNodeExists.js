/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    const [name] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    const node = d.client.shoukaku.nodes?.get(name);
    data.result = Boolean(node);

    return {
        code: d.util.setCode(data)
    };
};
