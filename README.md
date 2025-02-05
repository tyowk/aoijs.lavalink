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
const { Manager } = require('aoijs.lavalink');

const client = new AoiClient({ ... });

const voice = new Manager(client, {
    nodes: [{
        name: 'my lavalink node',
        host: 'yourdomain.com',
        port: 0000,
        auth: 'youshallnotpass',
        secure: false
    }]
});
```

<details>
<summary><h2>Options</h2><p>Options who have a leading question mark (?) are optional and not required, however if you want to use them, make sure to remove it!</p></summary>
    
```js
new Manager(<Client>, {
    nodes: [{
        name: string,
        host: string,
        port: number,
        auth: string,
        secure: boolean
    },{ /* add more node */ }],

    maxQueueSize?: number,
    maxPlaylistSize?: number,
    maxHistorySize?: number,
    searchEngine?: string,
    debug?: boolean,
    defaultVolume?: number,
    maxVolume?: number,
    noLimitVolume?: boolean,
    deleteNowPlaying?: boolean
});
```

### Default Options
| Option | Type | Default | Description |
|--------|------|---------|--------------------|
| nodes | **[`Array`](#node-options)** | | (see below) |
| maxQueueSize | number | 100 | Maximum number of tracks that can be queued for playback. |
| maxPlaylistSize | number | 100 | Maximum number of tracks that can be in a playlist. |
| maxHistorySize | number | 100 | Maximum number of tracks that can be saved in the history. |
| searchEngine | string | youtube | Default search engine. You can set this to 'soundcloud' or 'spotify' or others. |
| debug | boolean | false | Whether to enable debug logs for the music client. |
| defaultVolume | number | 100 | Set default volume when the player created. |
| maxVolume | number | 200 | Maximum volume player can handle. |
| noLimitVolume | boolean | false | Whether to enable no limit volume (not recommended). |
| deleteNowPlaying | number | 200 | Whether to enable auto-delete now playing message when track ends. |

### Node Options
| Option | Type | Description |
|--------|------|--------------------|
| Name | string | custom name for the Lavalink node (can be any string) |
| host | string | URL to your Lavalink node. Replace with your actual Lavalink server URL. |
| port | number | Your lavalink server port. |
| auth | boolean | Authentication password for the Lavalink node. |
| secure | boolean | Set to true if your Lavalink server uses SSL/TLS (HTTPS). |

see [here](https://guide.shoukaku.shipgirl.moe/guides/2-options/) for more client options.

</details>

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

<details>
<summary><h3>Available Events</h3><p>Events are used to listen to specific changes of something, such as members or channels, which you then can use for your commands.

This section will list all events.</p></summary>
    
```sh
* trackStart
* trackEnd
* trackStuck
* trackPaused
* trackResumed
* queueStart
* queueEnd
* nodeConnect
* nodeReconnect
* nodeDisconnect
* nodeError
* nodeDestroy
* nodeRaw
* nodeDebug
* socketClosed
* playerCreate
* playerDestroy
* playerException
* playerUpdate
```
</details>

---

## Handlers

```js
const voice = new Manager(<Client>, { ... });

// Load custom music event handlers from a directory. 'false' disables debug logs.
voice.loadVoiceEvents('./voice/', false);
```

**Example Event File** (in `/voice/trackStart.js`):

```js
module.exports = [{
    channel: '$channelId', // The ID of the channel where the event will trigger (can be dynamic or static).
    type: 'trackStart', // The event type, e.g., when a track starts playing ('trackStart').
    code: `$songInfo[title]`, // The action to take when the event is triggered. Here it will return the title of the song.
}];
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
