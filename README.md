# Blacklight

[![Build](https://github.com/isamarin/blacklight/actions/workflows/build.yml/badge.svg)](https://github.com/isamarin/blacklight/actions/workflows/build.yml)
[![Status](https://img.shields.io/badge/status-public%20beta-107C10)](https://blacklight.isamarin.xyz)
[![Website](https://img.shields.io/badge/website-blacklight.isamarin.xyz-24292f)](https://blacklight.isamarin.xyz)

**Status: Public beta** — macOS and Windows builds are available; feedback and bug reports are welcome.

**Blacklight** is an independent open-source Xbox streaming tool — xCloud and console home streaming for **macOS** and **Windows** (Tauri). Built with TypeScript; streaming engine powered by [xbox-xcloud-player](https://github.com/unknownskl/xbox-xcloud-player).

**Maintainer:** Igor Samarin ([@isamarin](https://github.com/isamarin)) — mako.mmw@gmail.com

**Versioning:** [CalVer](https://calver.org/) (`2026.7.3`). Release tags: `v2026.7.3` (not the old fork `v3.*` prefix).

_DISCLAIMER: Blacklight is not affiliated with Microsoft, Xbox or Moonlight. All rights and trademarks are property of their respective owners._

## Features

- Stream video and audio from the Xbox One and Xbox Series
- Support for gamepad controls
- Supports rumble on xCloud
- Keyboard controls
- Build-in online friends list

<img src="images/main.png" width="400" /> <img src="images/stream.png" width="400" />

## Install

### Download pre-compiled binaries

[Latest releases](https://github.com/isamarin/blacklight/releases)

### Compile from source

See [Local development](#local-development).

## Keyboard controls

Keys are mapped as following by default:

    Dpad: Keypad direction controls
    Buttons: A, B, X, Y, Backspace (Mapped as B), Enter (Mapped as A)
    Nexus (Xbox button): N
    Left Bumper: [
    Right Bumper: ]
    Left Trigger: -
    Right Trigger: =
    View: V
    Menu: M

## Streaming stats

During the stream you can show debug statistics that contain extra data about the buffer queues and other information. To bring this up you can press `~` on your keyboard.

At the bottom-left you can see the status (although not always accurate). At the top-right you can find the FPS of the video and audio decoders including the latency. At the bottom-right you can find debug information about the buffer queues and other information that is useful for debugging perposes.

When possible always provide this information with your issue, if it is related.

## Online friends list

The application also provides a way to see which of your friends are online. This can be useful when you want to quickly check if anyone is online to play with :)

## Steam Deck Setup

This application is reported to be working on the Steam Deck with some small bugs and side-effects. You can map one of the Steam Deck back buttons to the 'N' key to simulate the Xbox button.

## Optional launch arguments

| Argument | Description |
|----------|--------------|
| --fullscreen | Starts the application in fullscreen |
| --connect=<value> | Will start stream once the user is authenticated. |

For console use `F000000000000000` format and for xCloud use `xcloud_<title>`.

## To close the application

Click on the Xbox logo at the top-left. It will ask you to confirm to close the window.

## Local Development

### Requirements

- Node.js ([https://nodejs.org/](https://nodejs.org/))
- pnpm ([https://pnpm.io/](https://pnpm.io/))
- Rust toolchain (for Tauri desktop builds)

### Steps to get up and running

Clone the repository:

    git clone https://github.com/isamarin/blacklight.git
    cd blacklight

Install dependencies:

    pnpm install

Run development build:

    pnpm build:deps
    pnpm desktop-tauri tauri:dev

Create production build:

    pnpm build:deps
    pnpm desktop-tauri tauri:build

Release tag (triggers CI draft release with DMG + NSIS):

    git tag -a v2026.7.3 -m "Blacklight 2026.7.3"
    git push origin v2026.7.3

Typecheck the Tauri UI:

    pnpm check:tauri

## Translations

Want to help with translations? Open an [issue](https://github.com/isamarin/blacklight/issues) or submit a PR with updated locale files.

## License

Blacklight is licensed under the [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0). You may use, modify, and distribute the software for **noncommercial** purposes only. Commercial use (including selling, sublicensing for profit, or using the software in a commercial product or service) is not permitted without separate permission from the copyright holders.

See [LICENSE](LICENSE) for the full text.

## Changelog

See [CHANGELOG.md](CHANGELOG.md)