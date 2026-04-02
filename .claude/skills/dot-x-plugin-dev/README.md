# dot-x-plugin-dev skill

An [agent skill](https://skills.sh) for building **Dot X plugins** using the Plugin SDK.

Install this skill to give your AI coding assistant deep knowledge of the Dot X Plugin SDK — covering the manifest format, lifecycle hooks, settings UI builders, device events, RGB control, config persistence, and marketplace publishing.

## Install

```bash
npx skills add DotMatrixLabs/create-dotx-plugin/dot-x-plugin-dev
```

Works with Claude Code, Cursor, Windsurf, and any agent that supports the [Agent Skills specification](https://agentskills.io/specification).

## What the skill covers

- **Scaffolding** — how to use `create-dotx-plugin` to bootstrap a new plugin
- **manifest.json** — all required and optional fields with examples
- **Lifecycle** — `onLoad` / `onUnload` and connection helpers
- **Config** — persistent local storage with `this.config`
- **Settings UI** — building settings pages with all available field types
- **Device events** — connect, disconnect, and control value updates
- **Toasts** — in-app notifications
- **RGB control** — effects, brightness, color, and speed
- **Action mapper** — system utility buttons with per-channel state
- **Publishing** — release workflow and marketplace submission

## Usage

Once installed, the skill activates automatically when you ask your AI assistant about Dot X plugin development. For example:

- *"Create a plugin that changes the RGB color when I mute my microphone"*
- *"Add a settings page to let the user configure an API key"*
- *"How do I listen for device value changes?"*
- *"Help me publish my plugin to the Dot X marketplace"*

## Full documentation

- Docs site: https://docs.dotmatrixlabs.com/plugin-sdk/
- LLM-friendly index: https://docs.dotmatrixlabs.com/llms.txt
- Full content: https://docs.dotmatrixlabs.com/llms-full.txt
