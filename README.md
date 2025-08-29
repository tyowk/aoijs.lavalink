<img src="https://aoilavalink.vercel.app/_astro/lavalink.YmUXcbpu_2mpBi3.webp" width="150">

# aoijs.lavalink

A package for integrating Lavalink with Aoi.js to enable music streaming in Discord bots.

- **[Documentation](https://aoilavalink.vercel.app)**
- **[Support Server](https://aoi.js.org/invite)**
- **[NPM](https://npmjs.org/package/aoijs.lavalink)**
- **[GitHub](https://github.com/tyowk/aoijs.lavalink)**

---

## Installation

**stable version:**
```bash
npm install aoijs.lavalink
```

**development version:**
```bash
npm install tyowk/aoijs.lavalink
```

---

## Setup

The setup is used to initialize the bot client and configure the Lavalink music system. aoi.js is the main client framework, and aoijs.lavalink is an integration that allows you to connect to a Lavalink server to stream music.

```js
const { AoiClient } = require('aoi.js');
const { Manager } = require('aoijs.lavalink');

const client = new AoiClient({ /* ••• */ });

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

<details open>
<summary>
    <h2>Options</h2>
    <p>Options who have a leading question mark (?) are optional and not required, however if you want to use them, make sure to remove it!</p>
</summary>

```js
new Manager(<AoiClient>, {
    nodes: [{
        name: string,
        host: string,
        port: number,
        auth: string,
        secure: boolean
    },{ /* ••• */ }],

    maxQueueSize?: number,
    maxPlaylistSize?: number,
    maxHistorySize?: number,
    searchEngine?: string,
    debug?: boolean,
    defaultVolume?: number,
    maxVolume?: number,
    noLimitVolume?: boolean,
    deleteNowPlaying?: boolean,
    playlist?: {
        enable: boolean,
        table: string,
        database?: unknown,
        maxSongs?: number,
        maxPlaylist?: number
    }
});

```

### Default Options

| Option            | Type                                | Default | Description                                                                     |
| ----------------- | ----------------------------------- | ------- | ------------------------------------------------------------------------------- |
| nodes             | **[`Node[]`](#node-options)**       | -       | (see below)                                                                     |
| playlist?         | **[`Playlist`](#playlist-options)** | -       | (see below)                                                                     |
| maxQueueSize?     | `number`                            | 100     | Maximum number of tracks that can be queued for playback.                       |
| maxPlaylistSize?  | `number`                            | 100     | Maximum number of tracks that can be in a playlist.                             |
| maxHistorySize?   | `number`                            | 100     | Maximum number of tracks that can be saved in the history.                      |
| searchEngine?     | `string`                            | youtube | Default search engine. You can set this to 'soundcloud' or 'spotify' or others. |
| debug?            | `boolean`                           | false   | Whether to enable debug logs for the music client.                              |
| defaultVolume?    | `number`                            | 100     | Set default volume when the player created.                                     |
| maxVolume?        | `number`                            | 200     | Maximum volume player can handle.                                               |
| noLimitVolume?    | `boolean`                           | false   | Whether to enable no limit volume (not recommended).                            |
| deleteNowPlaying? | `number`                            | 200     | Whether to enable auto-delete now playing message when track ends.              |


### Node Options

| Option | Type      | Description                                                              |
| ------ | --------- | ------------------------------------------------------------------------ |
| name?  | `string`  | custom name for the Lavalink node (can be any string)                    |
| host   | `string`  | URL to your Lavalink node. Replace with your actual Lavalink server URL. |
| port   | `number`  | Your lavalink server port.                                               |
| auth   | `boolean` | Authentication password for the Lavalink node.                           |
| secure | `boolean` | Set to true if your Lavalink server uses SSL/TLS (HTTPS).                |


### Playlist Options

| Option       | Type      | Description                                                           |
| ------------ | --------- | --------------------------------------------------------------------- |
| enable       | `boolean` | Whether to enable playlist feature or not.                            |
| table        | `string`  | Name of the database table to store playlists.                        |
| maxSongs?    | `number`  | Maximum number of songs allowed in a single playlist. (default is 20) |
| maxPlaylist? | `number`  | Maximum number of playlist allowed per user. (default is 10)          |
| database?    | `unknown` | Reference to the database instance                                    |

**see [here](https://guide.shoukaku.shipgirl.moe/guides/2-options/) for more client options.**

</details>

---

## Playlist

This feature allows users to create and manage playlists, enhancing their music experience.

**See the [documentation](https://aoilavalink.vercel.app/guides/playlist) for more information and guides**

---

## Events

You can listen to various events such as when a track starts, when the player is paused, etc., and respond to them with custom code.

```js
const voice = new Manager(<AoiClient>, { /* ••• */ });

voice.<eventName>({
    channel: '$channelId',
    code: `$songInfo[title]`
});
````

<details>
<summary><h3>Available Events</h3><p>Events are used to listen to specific changes of something, such as members or channels, which you then can use for your commands.

This section will list all events.</p></summary>

1. **trackStart**: _Triggered when a track begins playing on the Lavalink node. This marks the start of the track’s playback._
2. **trackEnd**: _Occurs when a track finishes playing. This can happen when the track ends naturally or when it is stopped before completion._
3. **trackStuck**: _Triggered when a track gets stuck due to an error or issue like buffering or network problems, preventing it from progressing._
4. **trackPaused**: _Occurs when the playback of the track is paused, either manually or automatically due to external reasons (e.g., user interaction or system settings)._
5. **trackResumed**: _Triggered when a previously paused track starts playing again, either after manual resumption or an automatic action._
6. **queueStart**: _Occurs when a new queue of tracks starts to be processed and played by the Lavalink node. This is the beginning of playback for a set of tracks._
7. **queueEnd**: _Triggered when the track queue finishes playing all the tracks. This event marks the end of the queue’s playback._
8. **nodeConnect**: _Triggered when a successful connection is established with a Lavalink node. The player can now interact with the node for streaming and playback._
9. **nodeReconnect**: _Occurs when a previously disconnected Lavalink node is reconnected. This could happen automatically after a temporary loss of connection._
10. **nodeDisconnect**: _This event occurs when the Lavalink node disconnects, either intentionally or due to a failure or disconnection._
11. **nodeError**: _Triggered when an error occurs with the Lavalink node, such as a failure in audio processing, network issues, or other internal node errors._
12. **nodeDestroy**: _Occurs when a Lavalink node is destroyed or cleaned up. This usually happens when the node is no longer needed or is being replaced._
13. **nodeDebug**: _This event provides debugging information about the Lavalink node. It’s often used to log detailed information about the node’s state for troubleshooting._
14. **socketClosed**: _Triggered when the socket connection between the client and Lavalink node is closed, either due to an error, timeout, or manual disconnection._
15. **playerCreate**: _Occurs when a new player instance is created. This happens when a new user starts playing music or a new player session is initialized._
16. **playerDestroy**: _Triggered when a player instance is destroyed. This occurs when a player session ends or is no longer needed._
17. **playerException**: _Occurs when an error or exception happens within the player, such as invalid operations, failed track loading, or playback errors._
18. **playerUpdate**: _Triggered when there’s an update to the player’s state, such as changes to the volume, track, or other settings that affect playback._
19. **playerMove**: _Triggered when the player moves to a different voice channel. This happens when the player switches its active voice connection, typically in response to a user command or action._

</details>

---

## Handlers

```js
const voice = new Manager(client, { /* ••• */ });

// Load custom music event handlers from a directory. 'false' disables debug logs.
voice.loadVoiceEvents('./voice/', false);
```

**Example Event File** (in `/voice/trackStart.js`):

```js
module.exports = [{
    channel: '$channelId',
    type: 'trackStart',
    code: `$songInfo[title]`
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
<img src="https://aoilavalink.vercel.app/_astro/lavabird.DpnUPx13.png" width="100">
<br>

**[Documentation](https://aoilavalink.vercel.app)** <br>
**[Support Server](https://aoi.js.org/invite)**

</div>
