/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    let [options = '{}', returnNode = 'false'] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, `Voice manager is not defined.`);

    try {
        options = JSON.parse(options);
    } catch (err) {
        return d.aoiError.fnError(d, 'custom', {}, `Invalid JSON format for options.`);
    }

    const { name, host, port, auth, secure } = options;

    if (!name) return d.aoiError.fnError(d, 'custom', {}, `"name" property is required!`);
    if (!host) return d.aoiError.fnError(d, 'custom', {}, `"host" property is required!`);
    if (!port) return d.aoiError.fnError(d, 'custom', {}, `"port" property is required!`);
    if (!auth) return d.aoiError.fnError(d, 'custom', {}, `"auth" property is required!`);
    if (typeof secure !== 'boolean') return d.aoiError.fnError(d, 'custom', {}, `"secure" property must be a boolean!`);

    let node = d.client.shoukaku.nodes?.get(name);
    if (node) return d.aoiError.fnError(d, 'custom', {}, `Node "${name}" already exists!`);

    node = await d.client.shoukaku.addNode({
        name,
        url: `${host}:${port}`,
        auth,
        secure
    });

    if (returnNode === 'true') data.result = typeof node === 'object' ? JSON.stringify(node) : node;

    return {
        code: d.util.setCode(data)
    };
};
