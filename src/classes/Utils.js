const { Group } = require('@aoijs/aoi.structures');

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
        this.package = 'aoijs.lavalink';
        this.support = 'https://discord.gg/hyQYXcVnmZ';
        this.time = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

exports.AoiError = AoiError;

/**
 * Utils class providing utility functions for time formatting and manipulation.
 *
 * @class Utils
 */
class Utils {
    /**
     * Formats a duration in milliseconds into a human-readable string.
     *
     * @static
     * @param {number} ms - The duration in milliseconds.
     * @returns {string} - The formatted time string (e.g., "1h 30m 15s").
     */
    static formatTime(ms) {
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
     * @static
     * @param {Array} array - The array to be chunked.
     * @param {number} size - The size of each chunk.
     * @returns {Array[]} - An array of chunked arrays.
     */
    static chunk(array, size) {
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
     * @static
     * @param {string} text - The text to be chunked.
     * @param {number} size - The size of each chunk.
     * @returns {Array[]} - An array of chunked text.
     */
    static textChunk(text, maxLength = 1024) {
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
     * @static
     * @param {string} string - The time string to parse (e.g., "1h 30m 15s").
     * @returns {number} - The total time in milliseconds.
     */
    static parseTime(string) {
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
}

exports.Utils = Utils;

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
    constructor(track, user) {
        if (!track) throw new AoiError('Track not provided!', 'AOI_TRACK_INVALID');

        (this.encoded = track.encoded),
            (this.info = {
                ...track.info,
                artist: track.info.author,
                thumbnail: track.info.artworkUrl,
                url: track.info.uri,
                duration: Utils.formatTime(track.info.length) || '0s',
                durationMs: track.info.length,
                requester: {
                    ...user,
                    avatar: typeof user?.displayAvatarURL === 'function' ? user?.displayAvatarURL() : user?.avatar,
                    banner: typeof user?.bannerURL === 'function' ? user?.bannerURL() : user?.banner,
                },
                userdata: {
                    ...track.userData,
                },
                plugininfo: {
                    ...track.pluginInfo,
                },
            });
    }
};

/**
 * Lyrics class
 *
 * @class Lyrics
 */
exports.Lyrics = class Lyrics {
    /**
     * Search a lyrics of a given song.
     *
     * @static
     * @async
     * @param {string} query - The song title.
     * @returns {Object} - Return the lyrics and other information.
     * @throws {AoiError} - Throws an error if the song is not provided.
     */
    static async search(query) {
        if (!query) throw new AoiError('Song title not provided!', 'AOI_TITLE_INVALID');

        query = query
            .toLowerCase()
            .replace(
                /((\[|\()(?!.*?(remix|edit|remake)).*?(\]|\))|\/+|-+| x |,|"|video oficial|official lyric video| ft.?|\|+|yhlqmdlg|x100pre|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF]|\u274C)/g,
                '',
            )
            .replace(/  +/g, ' ')
            .trim();

        let response = await fetch(
            `https://lyrics.lewdhutao.my.eu.org/musixmatch/lyrics?title=${encodeURIComponent(query)}`,
        );

        if (!response.ok) return {};
        response = await response.json();

        return {
            query,
            title: response.track_name,
            artist: response.artist_name,
            thumbnail: response.artwork_url,
            source: response.search_engine,
            id: response.track_id,
            lyrics: response.lyrics,
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
