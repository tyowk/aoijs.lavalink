/**
 * @param {import("..").Data} d
 */
module.exports = (d) => {
    const data = d.util.aoiFunc(d);
    let [value] = data.inside.splits;
    value = Number(value);

    const manager = d.client.shoukaku;
    if (!manager) return d.aoiError.fnError(d, 'custom', {}, 'Voice manager is not defined.');

    const player = d.client.queue.get(d.guild?.id);
    if (!player) return d.aoiError.fnError(d, 'custom', {}, 'There is no player for this guild.');

    if (!value) {
        data.result = player.volume();
    } else {
        const { noLimitVolume, maxVolume } = d.client.music;
        if (isNaN(value)) return d.aoiError.fnError(d, 'custom', {}, 'Please provide a valid number.');

        if (noLimitVolume !== true && value > maxVolume)
            return d.aoiError.fnError(d, 'custom', {}, `The volume can't be higher than ${maxVolume}.`);

        if (noLimitVolume !== true && value < 0)
            return d.aoiError.fnError(d, 'custom', {}, "The volume can't be lower than 0.");

        player.volume(value);
    }

    return {
        code: d.util.setCode(data)
    };
};
