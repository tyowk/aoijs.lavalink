const { Lyrics } = require('../../classes/Utils.js');

/**
 * @param {import("..").Data} d
 */
module.exports = async (d) => {
    const data = d.util.aoiFunc(d);
    if (data.err) return d.error(data.err);
    let [title, property = 'lyrics'] = data.inside.splits;
    title = title
        ?.addBrackets()
        .toLowerCase()
        .replace(
            /((\[|\()(?!.*?(remix|edit|remake)).*?(\]|\))|\/+|-+| x |,|"|video oficial|official lyric video| ft.?|\|+|yhlqmdlg|x100pre|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]|\u274C)/g,
            ''
        )
        .replace(/ {2,}/g, ' ')
        .trim();

    if (!title) return d.aoiError.fnError(d, 'custom', {}, `Please provide a song title you want to retrieve.`);

    const result = d.data.lyrics && d.data.lyrics?.query === title ? d.data.lyrics : await Lyrics.search(title);

    d.data.lyrics = result;
    data.result = result?.[property];

    return {
        code: d.util.setCode(data)
    };
};
