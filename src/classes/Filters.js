/**
 * Filters object containing various audio effects and equalizer settings.
 *
 * @namespace Filters
 * @property {Object} clear - Clears all filters.
 * @property {Object} 8d - 8D audio effect with rotation settings.
 * @property {Object} soft - Soft filter with low-pass settings.
 * @property {Object} speed - Speed adjustment with timescale settings.
 * @property {Object} karaoke - Karaoke effect with level and filter settings.
 * @property {Object} nightcore - Nightcore effect with speed and pitch adjustments.
 * @property {Object} pop - Equalizer settings for pop music.
 * @property {Object} vaporwave - Vaporwave effect with equalizer and timescale settings.
 * @property {Object} bass - Equalizer settings for enhanced bass.
 * @property {Object} party - Equalizer settings for party music.
 * @property {Object} earrape - Equalizer settings for extreme loudness.
 * @property {Object} equalizer - General equalizer settings.
 * @property {Object} electronic - Equalizer settings for electronic music.
 * @property {Object} radio - Equalizer settings for radio-style audio.
 * @property {Object} tremolo - Tremolo effect with depth and frequency settings.
 * @property {Object} treblebass - Equalizer settings for treble and bass enhancement.
 * @property {Object} vibrato - Vibrato effect with depth and frequency settings.
 * @property {Object} china - Timescale settings for a specific audio effect.
 * @property {Object} chimpunk - Timescale settings for a chipmunk voice effect.
 * @property {Object} darthvader - Timescale settings for a Darth Vader voice effect.
 * @property {Object} daycore - Daycore effect with equalizer and timescale settings.
 * @property {Object} doubletime - Timescale settings for double speed.
 * @property {Object} pitch - Timescale settings for pitch adjustment.
 * @property {Object} rate - Timescale settings for rate adjustment.
 * @property {Object} slow - Timescale settings for slow playback.
 */
exports.Filters = {
    clear: {},
    '8d': {
        rotation: {
            rotationHz: 0.2
        }
    },
    soft: {
        lowPass: {
            smoothing: 20.0
        }
    },
    speed: {
        timescale: {
            speed: 1.501,
            pitch: 1.245,
            rate: 1.921
        }
    },
    karaoke: {
        karaoke: {
            level: 1.0,
            monoLevel: 1.0,
            filterBand: 220.0,
            filterWidth: 100.0
        }
    },
    nightcore: {
        timescale: {
            speed: 1.3,
            pitch: 1.3
        }
    },
    pop: {
        equalizer: [
            { band: 0, gain: -0.25 },
            { band: 1, gain: 0.48 },
            { band: 2, gain: 0.59 },
            { band: 3, gain: 0.72 },
            { band: 4, gain: 0.56 },
            { band: 6, gain: -0.24 },
            { band: 8, gain: -0.16 }
        ]
    },
    vaporwave: {
        equalizer: [
            { band: 1, gain: 0.3 },
            { band: 0, gain: 0.3 }
        ],
        timescale: { pitch: 0.5 },
        tremolo: { depth: 0.3, frequency: 14 }
    },
    bass: {
        equalizer: [
            { band: 0, gain: 0.1 },
            { band: 1, gain: 0.1 },
            { band: 2, gain: 0.05 },
            { band: 3, gain: 0.05 },
            { band: 4, gain: -0.05 },
            { band: 5, gain: -0.05 },
            { band: 6, gain: 0 },
            { band: 7, gain: -0.05 },
            { band: 8, gain: -0.05 },
            { band: 9, gain: 0 },
            { band: 10, gain: 0.05 },
            { band: 11, gain: 0.05 },
            { band: 12, gain: 0.1 },
            { band: 13, gain: 0.1 }
        ]
    },
    party: {
        equalizer: [
            { band: 0, gain: -1.16 },
            { band: 1, gain: 0.28 },
            { band: 2, gain: 0.42 },
            { band: 3, gain: 0.5 },
            { band: 4, gain: 0.36 },
            { band: 5, gain: 0 },
            { band: 6, gain: -0.3 },
            { band: 7, gain: -0.21 },
            { band: 8, gain: -0.21 }
        ]
    },
    earrape: {
        equalizer: [
            { band: 0, gain: 0.25 },
            { band: 1, gain: 0.5 },
            { band: 2, gain: -0.5 },
            { band: 3, gain: -0.25 },
            { band: 4, gain: 0 },
            { band: 6, gain: -0.025 },
            { band: 7, gain: -0.0175 },
            { band: 8, gain: 0 },
            { band: 9, gain: 0 },
            { band: 10, gain: 0.0125 },
            { band: 11, gain: 0.025 },
            { band: 12, gain: 0.375 },
            { band: 13, gain: 0.125 },
            { band: 14, gain: 0.125 }
        ]
    },
    equalizer: {
        equalizer: [
            { band: 0, gain: 0.375 },
            { band: 1, gain: 0.35 },
            { band: 2, gain: 0.125 },
            { band: 5, gain: -0.125 },
            { band: 6, gain: -0.125 },
            { band: 8, gain: 0.25 },
            { band: 9, gain: 0.125 },
            { band: 10, gain: 0.15 },
            { band: 11, gain: 0.2 },
            { band: 12, gain: 0.25 },
            { band: 13, gain: 0.35 },
            { band: 14, gain: 0.4 }
        ]
    },
    electronic: {
        equalizer: [
            { band: 0, gain: 0.375 },
            { band: 1, gain: 0.35 },
            { band: 2, gain: 0.125 },
            { band: 5, gain: -0.125 },
            { band: 6, gain: -0.125 },
            { band: 8, gain: 0.25 },
            { band: 9, gain: 0.125 },
            { band: 10, gain: 0.15 },
            { band: 11, gain: 0.2 },
            { band: 12, gain: 0.25 },
            { band: 13, gain: 0.35 },
            { band: 14, gain: 0.4 }
        ]
    },
    radio: {
        equalizer: [
            { band: 0, gain: -0.25 },
            { band: 1, gain: 0.48 },
            { band: 2, gain: 0.59 },
            { band: 3, gain: 0.72 },
            { band: 4, gain: 0.56 },
            { band: 6, gain: -0.24 },
            { band: 8, gain: -0.16 }
        ]
    },
    tremolo: {
        tremolo: {
            depth: 0.3,
            frequency: 14
        }
    },
    treblebass: {
        equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0 },
            { band: 4, gain: -0.5 },
            { band: 5, gain: 0.15 },
            { band: 6, gain: -0.45 },
            { band: 7, gain: 0.23 },
            { band: 8, gain: 0.35 },
            { band: 9, gain: 0.45 },
            { band: 10, gain: 0.55 },
            { band: 11, gain: 0.6 },
            { band: 12, gain: 0.55 }
        ]
    },
    vibrato: {
        vibrato: {
            depth: 0.3,
            frequency: 14
        }
    },
    china: {
        timescale: {
            speed: 0.75,
            pitch: 1.25,
            rate: 1.25
        }
    },
    chimpunk: {
        timescale: {
            speed: 1.05,
            pitch: 1.35,
            rate: 1.25
        }
    },
    darthvader: {
        timescale: {
            speed: 0.975,
            pitch: 0.5,
            rate: 0.8
        }
    },
    daycore: {
        equalizer: [
            { band: 0, gain: 0 },
            { band: 1, gain: 0 },
            { band: 2, gain: 0 },
            { band: 3, gain: 0 },
            { band: 4, gain: 0 },
            { band: 5, gain: 0 },
            { band: 6, gain: 0 },
            { band: 7, gain: 0 },
            { band: 8, gain: -0.25 },
            { band: 9, gain: -0.25 },
            { band: 10, gain: -0.25 },
            { band: 11, gain: -0.25 },
            { band: 12, gain: -0.25 },
            { band: 13, gain: -0.25 }
        ],
        timescale: {
            pitch: 0.63,
            rate: 1.05
        }
    },
    doubletime: {
        timescale: {
            speed: 1.165
        }
    },
    pitch: {
        timescale: { pitch: 3 }
    },
    rate: {
        timescale: { rate: 2 }
    },
    slow: {
        timescale: {
            speed: 0.5,
            pitch: 1.0,
            rate: 0.8
        }
    }
};
