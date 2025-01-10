const { readdirSync, statSync } = require('node:fs');
const { blue, cyan, red } = require('chalk');
const { join } = require('node:path');

/**
 * Functions class to manage and load functions from a specified directory.
 *
 * @class Functions
 * @param {Client} client - The discord client.
 * @param {string} basePath - The base path from which to load function files.
 * @param {boolean} debug - Flag to enable or disable debug logging.
 */
exports.Functions = class Functions {
    constructor(client, basePath, debug) {
        if (!basePath || !client) return;
        client.returnCode = (d, data) => {
            return {
                code: d.util.setCode(data),
            };
        };

        try {
            const files = readdirSync(basePath);
            for (const file of files) {
                const filePath = join(basePath, file);
                if (!statSync(filePath).isDirectory() && file.endsWith('.js')) {
                    const func = require(filePath);
                    if (typeof func !== 'function') {
                        if (debug) this.#debug('error', file);
                        continue;
                    }

                    const name = file.split('.')[0];
                    if (debug) this.#debug('success', file);
                    client.functionManager.createFunction({
                        name: `$${name}`,
                        type: 'djs',
                        code: func,
                    });
                } else {
                    new this.constructor(client, filePath, debug);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Logs debug information about function loading.
     *
     * @param {string} type - The type of debug message ('success' or 'error').
     * @param {string} file - The name of the file being processed.
     */
    #debug(type, file) {
        const name = file.split('.')[0];
        if (type === 'success') {
            console.log(`[${blue('DEBUG')}] :: Function loaded: ${cyan(`$${name}`)}`);
        } else if (type === 'error') {
            console.log(`[${blue('DEBUG')}] :: Failed to Load: ${red(`$${name}`)}`);
        }
    }
};
