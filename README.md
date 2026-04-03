# Media Control

A Dot X plugin that controls the current Windows media session (Spotify, browsers, etc.) from physical sliders on a Decker device.

## How it works

The plugin exposes two action-mapper buttons that you assign to sliders in the Dot X app:

### Media: Pause
Assign to any slider. When the slider drops below the **Pause Threshold** (default: 10), playback is paused. When it rises back above the threshold, playback resumes (configurable).

### Media: Skip
Assign to any slider centered at rest. When the slider moves far enough from its center position:
- **Right/up** past the Skip Distance → next track
- **Left/down** past the Skip Distance → previous track

**Previous track behavior:** if you are more than 3 seconds into the current track, the first skip-previous call restarts it (normal OS behavior). The plugin detects this and issues a second call 150 ms later so you always land on the actual previous track.

The plugin talks to Windows via a native Rust DLL loaded through Deno FFI, bypassing npm entirely for minimal latency.

---

## Prerequisites

- [Dot X](https://dotmatrixlabs.com) running (starts the local plugin server on port 3001)
- [Deno](https://deno.com) 1.41+
- [Rust + Cargo](https://rustup.rs) (only needed to build the DLL from source)

---

## Build

### 1. Build the native DLL

```bash
deno task build-native
```

This runs `cargo build --release` inside `native/` and produces `native/target/release/media_control.dll`.

### 2. Start the plugin

```bash
deno task start
```

The plugin connects to Dot X, registers the two action buttons, and is ready to use.

---

## Settings

Open the plugin settings in Dot X to adjust:

| Setting | Default | Description |
|---|---|---|
| Pause Threshold | 10 | Slider value (0–100) below which media is paused |
| Resume on slider up | On | Resume playback when the slider rises back above the threshold |
| Skip Center Point | 50 | Resting position of the skip slider |
| Skip Distance | 20 | Distance from center needed to trigger skip/previous |

---

## File structure

```
manifest.json                        # Plugin metadata and permissions
main.ts                              # Plugin logic (Deno FFI + SDK)
deno.json                            # Tasks: start, build-native
native/
  Cargo.toml                         # Rust crate (cdylib)
  src/lib.rs                         # media_play / media_pause / media_next / media_previous
  target/release/media_control.dll   # Built output (gitignored)
dist/
  plugin.zip                         # Packaged plugin (gitignored)
```

---

## Packaging

To produce a distributable zip:

```bash
powershell -Command "Compress-Archive -Force -Path main.ts,manifest.json,deno.json,'native/target/release/media_control.dll' -DestinationPath dist/plugin.zip"
```

The included files are declared in `manifest.json` under `packaging.include`.

---

## Troubleshooting

- **DLL not found** — run `deno task build-native` first; the DLL must exist at `native/target/release/media_control.dll`
- **Connection refused** — make sure the Dot X app is running before starting the plugin
- **Previous always restarts** — increase the Skip Distance so the slider movement is unambiguous
- Check firewall/antivirus if connection timeouts persist

## Learn more

- [Getting Started](https://docs.dotmatrixlabs.com/plugin-sdk/getting-started/first-plugin)
- [SDK Reference](https://docs.dotmatrixlabs.com/plugin-sdk/sdk-reference)
- [Manifest reference](https://docs.dotmatrixlabs.com/plugin-sdk/manifest)
