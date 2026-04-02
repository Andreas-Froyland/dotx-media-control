---
name: dot-x-plugin-dev
description: Build Dot X plugins using the Plugin SDK. Use when scaffolding, implementing, or debugging a Dot X plugin — covers manifest, lifecycle hooks, settings UI, device events, config persistence, RGB control, and publishing to the marketplace.
license: MIT
metadata:
  author: DotMatrixLabs
  docs: https://docs.dotmatrixlabs.com/llms.txt
  docs-full: https://docs.dotmatrixlabs.com/llms-full.txt
---

# Dot X Plugin Developer Skill

You are helping a developer build a plugin for **Dot X** — a desktop application by DotMatrixLabs that controls hardware devices like Decker (a physical volume mixer) with RGB lighting.

Plugins run as background processes that connect to Dot X over a local Socket.IO server on port 3001. They are built with the `@dotmatrixlabs/dotx-plugin-sdk` package.

Full documentation is available at https://docs.dotmatrixlabs.com/llms-full.txt — fetch it for deeper context when needed.

---

## Scaffolding

Always recommend scaffolding with the official CLI:

```bash
npx @dotmatrixlabs/create-dotx-plugin
```

Choose **Deno** (recommended — TypeScript, zero config) or **Node** (esbuild, npm ecosystem).

---

## Project Structure

```
my-plugin/
├── manifest.json       # Required — plugin metadata
├── main.ts             # Source (TypeScript)
├── main.js             # Compiled output (Node only)
├── package.json        # Node projects only
└── README.md
```

---

## manifest.json

Required fields:
```json
{
  "id": "my-plugin",           // kebab-case, unique
  "name": "My Plugin",         // display name
  "version": "0.1.0",         // semver
  "description": "...",
  "author": "Your Name",
  "dotxVersion": ">=1.0.0",   // Dot X version range
  "permissions": [],           // net | env | run | ffi | sys | read | write | hrtime | all
  "main": "main.js"            // compiled entry point
}
```

Optional fields: `longDescription`, `license`, `repository`, `links`, `packaging.include`.

---

## Plugin Anatomy

Every plugin extends `Plugin` and calls `runPlugin`:

```typescript
import Plugin, { runPlugin } from '@dotmatrixlabs/dotx-plugin-sdk';

class MyPlugin extends Plugin {
  async onLoad() {
    // Called when connected and ready — initialize everything here
  }

  async onUnload() {
    // Called on shutdown — clean up timers, connections, etc.
    // Must be idempotent
  }
}

runPlugin(MyPlugin);
```

---

## Lifecycle

| Method | When called |
|--------|------------|
| `onLoad()` | Plugin connected and registered |
| `onUnload()` | Graceful shutdown |

Connection helpers:
```typescript
this.getConnectionStatus()   // 'connected' | 'connecting' | 'disconnected' | 'destroyed'
this.isConnected()           // boolean
await this.waitForConnection()
```

---

## Config (`this.config`)

Persistent local JSON storage:

```typescript
async onLoad() {
  this.config.init({ defaults: { apiKey: '', enabled: true } });

  const key = this.config.get<string>('apiKey', '');
  this.config.set('apiKey', 'new-value');
  this.config.set({ setting1: val1, setting2: val2 }); // bulk
}
```

---

## Settings UI (`this.settingsPage`)

Build a settings UI with fluent builders:

```typescript
await this.settingsPage.addSettings((s) => {
  s.addSection('general').setName('General');

  s.addInput('apiKey')
    .setLabel('API Key')
    .setType('password')
    .setValue(this.config.get('apiKey', ''))
    .onChange(({ value }) => this.config.set('apiKey', value));

  s.addSwitch('enabled')
    .setLabel('Enable')
    .setValue(this.config.get('enabled', true))
    .onChange(({ value }) => this.config.set('enabled', value));

  s.addSelect('mode')
    .setLabel('Mode')
    .setOptions([
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ])
    .setValue(this.config.get('mode', 'a'))
    .onChange(({ value }) => this.config.set('mode', value));

  s.addButton('save')
    .setTitle('Save')
    .setStyle('primary')
    .onClick(() => { /* handle */ });
});
```

Available field types: `addSection`, `addInput`, `addSwitch`, `addSelect`, `addButton`, `addBadge`, `addText`, `addInfo`.

All fields support `.setLabel()`, `.setDesc()`, `.setDisabled()`, `.setHidden()`, `.assign()`.

---

## Device Events (`this.device`)

```typescript
async onLoad() {
  const devices = await this.device.getConnected();

  this.device.onConnect((device) => {
    // device.name, device.port, device.state, device.connected_at
  });

  this.device.onDisconnect((device) => { /* cleanup */ });

  this.device.onUpdate(({ changes, values }) => {
    // changes: Array<{ index, oldValue, newValue }>
    // values: current state of all controls
    changes.forEach(({ index, newValue }) => {
      console.log(`Control ${index} → ${newValue}`);
    });
  });
}
```

---

## Toast Notifications (`this.ui`)

```typescript
await this.ui.showToast({
  message: 'Done!',
  type: 'success', // 'success' | 'info' | 'warning' | 'error'
  duration: 3000,
});
```

---

## RGB Control (`this.device.rgb`)

```typescript
await this.rgb.setEffect('breathing', 50, 80, '#7033d9');
// setEffect(effect, speed 1-100, brightness 0-100, color hex)

await this.rgb.setBrightness(75);
await this.rgb.setColor('#FF0000');
await this.rgb.setSpeed(30);
await this.rgb.turnOff();

this.rgb.getAvailableEffects();
// 'rainbow' | 'static' | 'off' | 'lightningStorm' | 'candle' | 'perimeter' | 'breathing'

this.rgb.getCurrentState(); // { effect, speed, brightness, color }
```

---

## System Utility Buttons (`this.actionmapper`)

Buttons that appear in the Dot X action mapper:

```typescript
this.actionmapper
  .addSystemUtilButton('my-action')
  .setTitle('My Action')
  .setIcon('fas fa-bolt fa-lg')
  .onClick(({ selected, channel }) => {
    console.log(`Channel ${channel}, selected: ${selected}`);
  })
  .setAutoPersist(true)
  .addSettings((s) => {
    s.addSection('cfg').setName('Action Settings');
    s.addInput('label').setLabel('Label').setValue('Default');
  });
```

---

## Development Workflow

1. Start Dot X (enables the Socket.IO server on port 3001)
2. Run the plugin from its folder:
   - **Deno:** `deno task start` (or `deno task dev` for watch mode)
   - **Node:** `npm start`
3. Logs appear in `plugin.log` and in the Dot X app
4. Keep `onUnload()` idempotent — Dot X may restart the plugin

---

## Publishing to the Marketplace

1. Add the GitHub Actions release workflow (included in scaffold)
2. Set manifest fields: `longDescription`, `license`, `repository`, `links`
3. Submit the plugin to the registry at https://github.com/DotMatrixLabs/dot-x-plugins by opening a PR adding your entry to `plugins-source.json`
4. Release flow:
   - Update `version` in `manifest.json` and `package.json`
   - Commit, push, then push a version tag: `git tag v0.1.0 && git push --tags`
   - GitHub Actions builds `dist/plugin.zip` and attaches it to the release

---

## Common Patterns

**Wait for a device before acting:**
```typescript
async onLoad() {
  await this.device.waitForAny?.() ?? await this.waitForConnection();
  const [device] = await this.device.getConnected();
  // now safe to use device
}
```

**Polling with cleanup:**
```typescript
private timer?: ReturnType<typeof setInterval>;

async onLoad() {
  this.timer = setInterval(() => this.tick(), 5000);
}

async onUnload() {
  if (this.timer) clearInterval(this.timer);
}
```

**Permissions:** Always declare required permissions in `manifest.json`. Use the minimum set needed — request `net` for HTTP calls, `env` to read environment variables, `read`/`write` for file access.
