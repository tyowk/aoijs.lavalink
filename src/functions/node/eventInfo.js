/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    const [property = 'name'] = data.inside.splits;

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    const info = d.data.nodeEvent;
    if (!info && typeof info === 'object') return d.client.returnCode(d, data);

    let result = info?.[property];
    if (typeof result === 'object') result = JSON.stringify(result);
    if (!result) return d.client.returnCode(d, data);

    data.result = result;
    return {
        code: d.util.setCode(data)
    };
};
