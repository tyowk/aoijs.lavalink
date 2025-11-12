/**
 * Manages resources and operations.
 * @type {Manager}
 */
exports.Manager = require("./classes/Manager.js").Manager;

/**
 * Manages playlist.
 * @type {Playlist}
 */
exports.Playlist = require("./classes/Playlist.js").Playlist;

/**
 * Represents a queue of tasks or jobs.
 * @type {Queue}
 */
exports.Queue = require("./classes/Queue.js").Queue;

/**
 * Dispatches tasks or events to handlers.
 * @type {Dispatcher}
 */
exports.Dispatcher = require("./classes/Dispatcher.js").Dispatcher;

/**
 * Loads and manages functions in the application.
 * @type {Functions}
 */
exports.Functions = require("./classes/Functions.js").Functions;

/**
 * Contains various data filters as an object.
 * @type {Filters}
 */
exports.Filters = require("./classes/Filters.js").Filters;

/**
 * Utility functions for the application.
 * @type {Utils}
 */
exports.Utils = require("./classes/Utils.js").Utils;

/**
 * Custom error handler for detailed error messages.
 * @type {AoiError}
 */
exports.AoiError = require("./classes/Utils.js").AoiError;

/**
 * Builds and manages tracks.
 * @type {Track}
 */
exports.Track = require("./classes/Utils.js").Track;

/**
 * Searches and retrieves song lyrics.
 * @type {Lyrics}
 */
exports.Lyrics = require("./classes/Utils.js").Lyrics;
