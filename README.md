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

````

### Default Options
| Option           | Type                         | Default | Description                                                                     |
|------------------|------------------------------|---------|---------------------------------------------------------------------------------|
| nodes            | **[`Array`](#node-options)** |         | (see below)                                                                     |
| maxQueueSize     | number                       | 100     | Maximum number of tracks that can be queued for playback.                       |
| maxPlaylistSize  | number                       | 100     | Maximum number of tracks that can be in a playlist.                             |
| maxHistorySize   | number                       | 100     | Maximum number of tracks that can be saved in the history.                      |
| searchEngine     | string                       | youtube | Default search engine. You can set this to 'soundcloud' or 'spotify' or others. |
| debug            | boolean                      | false   | Whether to enable debug logs for the music client.                              |
| defaultVolume    | number                       | 100     | Set default volume when the player created.                                     |
| maxVolume        | number                       | 200     | Maximum volume player can handle.                                               |
| noLimitVolume    | boolean                      | false   | Whether to enable no limit volume (not recommended).                            |
| deleteNowPlaying | number                       | 200     | Whether to enable auto-delete now playing message when track ends.              |

### Node Options
| Option | Type    | Description                                                              |
|--------|---------|--------------------------------------------------------------------------|
| Name   | string  | custom name for the Lavalink node (can be any string)                    |
| host   | string  | URL to your Lavalink node. Replace with your actual Lavalink server URL. |
| port   | number  | Your lavalink server port.                                               |
| auth   | boolean | Authentication password for the Lavalink node.                           |
| secure | boolean | Set to true if your Lavalink server uses SSL/TLS (HTTPS).                |

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
````

<details>
<summary><h3>Available Events</h3><p>Events are used to listen to specific changes of something, such as members or channels, which you then can use for your commands.

This section will list all events.</p></summary>

1. **trackStart**: Triggered when a track begins playing on the Lavalink node. This marks the start of the track’s playback.
2. **trackEnd**: Occurs when a track finishes playing. This can happen when the track ends naturally or when it is stopped before completion.
3. **trackStuck**: Triggered when a track gets stuck due to an error or issue like buffering or network problems, preventing it from progressing.
4. **trackPaused**: Occurs when the playback of the track is paused, either manually or automatically due to external reasons (e.g., user interaction or system settings).
5. **trackResumed**: Triggered when a previously paused track starts playing again, either after manual resumption or an automatic action.
6. **queueStart**: Occurs when a new queue of tracks starts to be processed and played by the Lavalink node. This is the beginning of playback for a set of tracks.
7. **queueEnd**: Triggered when the track queue finishes playing all the tracks. This event marks the end of the queue’s playback.
8. **nodeConnect**: Triggered when a successful connection is established with a Lavalink node. The player can now interact with the node for streaming and playback.
9. **nodeReconnect**: Occurs when a previously disconnected Lavalink node is reconnected. This could happen automatically after a temporary loss of connection.
10. **nodeDisconnect**: This event occurs when the Lavalink node disconnects, either intentionally (like stopping the player) or due to a failure or disconnection.
11. **nodeError**: Triggered when an error occurs with the Lavalink node, such as a failure in audio processing, network issues, or other internal node errors.
12. **nodeDestroy**: Occurs when a Lavalink node is destroyed or cleaned up. This usually happens when the node is no longer needed or is being replaced.
13. **nodeDebug**: This event provides debugging information about the Lavalink node. It’s often used to log detailed information about the node’s state for troubleshooting.
14. **socketClosed**: Triggered when the socket connection between the client and Lavalink node is closed, either due to an error, timeout, or manual disconnection.
15. **playerCreate**: Occurs when a new player instance is created. This happens when a new user starts playing music or a new player session is initialized.
16. **playerDestroy**: Triggered when a player instance is destroyed. This occurs when a player session ends or is no longer needed.
17. **playerException**: Occurs when an error or exception happens within the player, such as invalid operations, failed track loading, or playback errors.
18. **playerUpdate**: Triggered when there’s an update to the player’s state, such as changes to the volume, track, or other settings that affect playback.
19. **playerMove**: Triggered when the player moves to a different voice channel. This happens when the player switches its active voice connection, typically in response to a user command or action.

</details>

---

## Handlers

```js
const voice = new Manager(client, { ... });

// Load custom music event handlers from a directory. 'false' disables debug logs.
voice.loadVoiceEvents('./voice/', false);
```

**Example Event File** (in `/voice/trackStart.js`):

```js
module.exports = {
    channel: '$channelId', // The ID of the channel where the event will trigger (can be dynamic or static).
    type: 'trackStart', // The event type, e.g., when a track starts playing ('trackStart').
    code: `$songInfo[title]` // The action to take when the event is triggered. Here it will return the title of the song.
};
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
