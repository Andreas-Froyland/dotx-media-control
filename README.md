# Media Control

A minimal plugin for Dot X. This template includes a Deno + TypeScript setup by default.

## Prerequisites
- Dot X application running (starts the local plugin server)
- Deno 1.41+ (or Node 16+ if using the Node template)

## Quick start (Deno)

```bash
deno task start
```

This runs `main.ts` with all permissions and connects to the Dot X plugin server.

## Development workflow
- Edit `main.ts` and save; restart the task to pick up changes
- Watch logs in the Dot X app and in `plugin.log` (created next to your files)
- Implement your plugin logic inside the `onLoad()` method

### Common tasks
- Start: `deno task start`
- Lint (optional): `deno lint`
- Format (optional): `deno fmt`

## Optional: Node + esbuild
If you prefer Node, install deps and build:

```bash
npm install
npm run build
npm start
```

Recommended when you scaffolded with the `--node` flag.

## File structure

```
manifest.json   # Plugin metadata (id, name, entry file)
main.ts         # Plugin entrypoint (uses runPlugin from the SDK)
deno.json       # Deno task (start)
.gitignore      # Useful ignores (node_modules, plugin.log)
README.md       # This file
```

## Troubleshooting
- Ensure the Dot X app is running before starting the plugin
- If connection fails, the SDK will retry and print detailed hints
- Check firewall/antivirus if timeouts persist

## Learn more
- [Getting Started](https://docs.dotmatrixlabs.com/plugin-sdk/getting-started/first-plugin)
- [Examples](https://docs.dotmatrixlabs.com/plugin-sdk/examples)
- [Manifest reference](https://docs.dotmatrixlabs.com/plugin-sdk/manifest)
- [SDK Reference](https://docs.dotmatrixlabs.com/plugin-sdk/sdk-reference)
