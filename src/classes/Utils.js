const { Group } = require('@aoijs/aoi.structures');
const { load } = require('cheerio');
const fetch = require('node-fetch');

/**
 * Custom Error class
 *
 * @class AoiError
 * @params {string} message - Error message.
 * @params {string|number} code - Error code.
 */
class AoiError extends Error {
    constructor(message, code) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}

exports.AoiError = AoiError;

/**
 * Utils class providing utility functions for time formatting and manipulation.
 *
 * @class Utils
 * @params {Client} client - The discord client instance.
 */
exports.Utils = class Utils {
    constructor(manager) {
        this.client = manager?.client;
        this.manager = manager;
    }

    /**
     * Formats a duration in milliseconds into a human-readable string.
     *
     * @param {number} ms - The duration in milliseconds.
     * @returns {string} - The formatted time string (e.g., "1h 30m 15s").
     */
    formatTime(ms) {
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        if (ms < minute) {
            return `${(ms / 1000).toFixed()}s`;
        } else if (ms < hour) {
            return `${Math.floor(ms / minute)}m ${Math.floor((ms % minute) / 1000)}s`;
        } else if (ms < day) {
            return `${Math.floor(ms / hour)}h ${Math.floor((ms % hour) / minute)}m`;
        } else {
            return `${Math.floor(ms / day)}d ${Math.floor((ms % day) / hour)}h`;
        }
    }

    /**
     * Splits an array into chunks of a specified size.
     *
     * @param {Array} array - The array to be chunked.
     * @param {number} size - The size of each chunk.
     * @returns {Array[]} - An array of chunked arrays.
     */
    chunk(array, size) {
        const chunked = [];
        let index = 0;
        while (index < array.length) {
            chunked.push(array.slice(index, size + index));
            index += size;
        }
        return chunked;
    }

    /**
     * Splits an text into chunks of a specified size.
     *
     * @param {string} text - The text to be chunked.
     * @param {number} size - The size of each chunk.
     * @returns {Array[]} - An array of chunked text.
     */
    textChunk(text, maxLength = 1024) {
        maxLength = Number(maxLength);
        if (!text || isNaN(maxLength)) return null;
        const chunks = [];
        let start = 0;

        while (start < text.length) {
            let end = start + maxLength;
            if (end < text.length) {
                while (end > start && text[end] !== ' ' && text[end] !== '\n') {
                    end--;
                }
                if (end === start) {
                    end = start + maxLength;
                }
            }
            chunks.push(text.slice(start, end).trim());
            start = end;
        }

        return chunks;
    }

    /**
     * Parses a time string into milliseconds.
     *
     * @param {string} string - The time string to parse (e.g., "1h 30m 15s").
     * @returns {number} - The total time in milliseconds.
     */
    parseTime(string) {
        const time = string.match(/([0-9]+[d,h,m,s])/g);
        if (!time) return 0;
        let ms = 0;
        for (const t of time) {
            const unit = t[t.length - 1];
            const amount = Number(t.slice(0, -1));
            if (unit === 'd') ms += amount * 24 * 60 * 60 * 1000;
            else if (unit === 'h') ms += amount * 60 * 60 * 1000;
            else if (unit === 'm') ms += amount * 60 * 1000;
            else if (unit === 's') ms += amount * 1000;
        }
        return ms;
    }
};

/**
 * Commands class to build aoi.js command handler.
 *
 * @class Commands
 */
exports.Commands = class Commands {
    constructor() {
        this.trackStart = new Group();
        this.trackEnd = new Group();
        this.trackStuck = new Group();
        this.trackPaused = new Group();
        this.trackResumed = new Group();
        this.playerCreate = new Group();
        this.playerDestroy = new Group();
        this.playerException = new Group();
        this.playerUpdate = new Group();
        this.queueStart = new Group();
        this.queueEnd = new Group();
        this.socketClosed = new Group();
        this.nodeConnect = new Group();
        this.nodeReconnect = new Group();
        this.nodeDebug = new Group();
        this.nodeDisconnect = new Group();
        this.nodeError = new Group();
        this.nodeDestroy = new Group();
    }
};

/**
 * Track class to builds a track object with additional user information.
 *
 * @class Track
 * @param {Object} track - The track data to build from.
 * @param {Object} user - The user requesting the track.
 * @returns {Object} - The constructed track object.
 * @throws {AoiError} - Throws an error if the track is not provided.
 */
exports.Track = class Track {
    constructor(track, user, client) {
        if (!track) throw new AoiError('Track not provided!', 'AOI_TRACK_INVALID');

        if (user && user.displayAvatarURL) user.avatar = user.displayAvatarURL();

        if (user && user.bannerURL) user.banner = user.bannerURL();

        (this.encoded = track.encoded),
            (this.info = {
                ...track.info,
                artist: track.info.author,
                thumbnail: track.info.artworkUrl,
                url: track.info.uri,
                duration: client.music.utils.formatTime(track.info.length) || 0,
                durationMs: track.info.length,
                requester: { ...user },
                userdata: { ...track.userData },
                plugininfo: { ...track.pluginInfo },
            });
    }
};

/**
 * Lyrics class
 *
 * @class Lyrics
 */
exports.Lyrics = class Lyrics {
    constructor() {}

    /**
     * Search a lyrics of a given song.
     *
     * @async
     * @param {string} query - The song title.
     * @returns {Object} - Return the lyrics and other information.
     * @throws {AoiError} - Throws an error if the song is not provided.
     */
    async search(query) {
        if (!query) throw new AoiError('Song title not provided!', 'AOI_TITLE_INVALID');

        query = query
            .toLowerCase()
            .replace(
                /((\[|\()(?!.*?(remix|edit|remake)).*?(\]|\))|\/+|-+| x |,|"|video oficial|official lyric video| ft.?|\|+|yhlqmdlg|x100pre|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]|\u274C)/g,
                '',
            )
            .replace(/  +/g, ' ')
            .trim();

        const html = await fetch(
            `https://www.google.com/search?q=${encodeURIComponent(query)}+lyrics&ie=UTF-8&tob=true`,
        ).then(x => x.textConverted());

        const $ = load(html);

        const lyrics = $('div[class="hwc"]')
            .find('div[class="BNeawe tAd8D AP7Wnd"]')
            .map((i, value) => $(value))
            .get();

        const title = $('span[class="BNeawe tAd8D AP7Wnd"]')?.text();
        const artist = $('span[class="BNeawe s3v9rd AP7Wnd"]')
            .map((i, value) => $(value))
            .get();

        const source = $('span[class="uEec3 AP7Wnd"]')?.text();

        if (!lyrics?.[0]) return;

        return {
            query,
            title,
            artist: artist[1]?.text(),
            lyrics: lyrics[0]?.text(),
            source,
        };
    }
};

/**
 * Queue class
 *
 * @class Queue
 * @extends Array
 */
exports.Queue = class Queue extends Array {
    constructor() {
        super();
    }
};

/**
 * History class
 *
 * @class History
 * @extends Array
 */
exports.History = class History extends Array {
    constructor() {
        super();
    }
};
