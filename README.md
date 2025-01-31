<img src="https://cdn.noujs.my.id/guild/lavalink.png" width="150">

# aoijs.lavalink

A package for integrating Lavalink with Aoi.js to enable music streaming in Discord bots.

- **[ Documentation ](https://lavalink.noujs.my.id)**
- **[ Support Server ](https://discord.com/invite/hyQYXcVnmZ)**
- **[ NPM ](https://npmjs.org/package/aoijs.lavalink)**
- **[ GitHub ](https://github.com/tyowk/aoijs.lavalink)**

---

## Installation

```bash
npm install aoijs.lavalink
```

---

## Setup

The setup is used to initialize the bot client and configure the Lavalink music system. aoi.js is the main client framework, and aoijs.lavalink is an integration that allows you to connect to a Lavalink server to stream music.

```js
const { AoiClient } = require('aoi.js');
const { Manager } = require('aoijs.lavalink'); // Importing the MusicClient for handling Lavalink integration.

const client = new AoiClient({ ... });

const voice = new Manager(client, {
    nodes: [{
        name: 'my lavalink node',  // A custom name for the Lavalink node (can be any string).
        host: 'yourdomain.com',    // URL to your Lavalink node. Replace with your actual Lavalink server URL.
        port: 0000,                // Your lavalink server port.
        auth: 'youshallnotpass',   // Authentication password for the Lavalink node.
        secure: false              // Set to true if your Lavalink server uses SSL/TLS (HTTPS).
    }],

    maxQueueSize: 100,             // Maximum number of tracks that can be queued for playback. (default is 100)
    maxPlaylistSize: 100,          // Maximum number of tracks that can be in a playlist. (default is 100)
    searchEngine: 'youtube',       // Default search engine. You can set this to 'soundcloud' or 'spotify' or others. (default is youtube)
    debug: false,                  // Whether to enable debug logs for the music client. default is false. (default is false)
    defaultVolume: 75,             // Set default volume when the player created (default is 100)
    maxVolume: 200,                // Maximum volume player can handle (default is 200)
    noLimitVolume: false           // Whether to enable no limit volume (not recommended) (default is false)
});
```

see [here](https://guide.shoukaku.shipgirl.moe/guides/2-options/) for more client options.

---

## Playlist

This feature allows users to create and manage playlists, enhancing their music experience.

**See the [documentation](https://lavalink.noujs.my.id/guides/playlist) for more information and guides**

---

## Events

You can listen to various events such as when a track starts, when the player is paused, etc., and respond to them with custom code.

```js
const voice = new Manager(<Client>, { ... });

voice.<eventName>({          // The event type, e.g., when a track starts playing ('trackStart').
    channel: '$channelId',   // The ID of the channel where the event will trigger (can be dynamic or static).
    code: `$songInfo[title]` // The action to take when the event is triggered. Here it will return the title of the song.
});
```

---

## Handlers

```js
const voice = new Manager(<Client>, { ... });

// Load custom music event handlers from a directory. 'false' disables debug logs.
voice.loadVoiceEvents('./voice/', false);
```

**Example Event File** (in `/voice/trackStart.js`):

```js
module.exports = [
    {
        channel: '$channelId', // The ID of the channel where the event will trigger (can be dynamic or static).
        type: 'trackStart', // The event type, e.g., when a track starts playing ('trackStart').
        code: `$songInfo[title]`, // The action to take when the event is triggered. Here it will return the title of the song.
    },
];
```

---

## Notice

- **Reading Functions**: Currently aoi.js reads `$` functions from bottom to top.

---

<div align="center">
<br>
<br>
<br>
<br>
<br>
<br>
<img src="https://cdn.noujs.my.id/guild/lavabird.png" width="100">
<br>

**[ Documentation ](https://lavalink.noujs.my.id)** <br>
**[ Support Server ](https://discord.com/invite/hyQYXcVnmZ)**

</div>
