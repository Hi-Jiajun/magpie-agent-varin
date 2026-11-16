# magpie-agent-varin

Adds **Varin** to magpie's Agents page, so the model its conversations run on is
picked next to every other agent's — one place, all agents.

Varin keeps its conversation default in one plain JSON file:

```json
// ~/.config/varin/agent-settings.json
{ "defaultProvider": "<channel uuid>", "defaultModel": "group/…",
  "defaultThinkingLevel": "high" }
```

`defaultModel` is the model id exactly as Varin's own channel lists it, so magpie
only has to write that one key. Switching off puts the file back as it was, key by
key; magpie never rewrites it whole.

## Install

```sh
magpie plugin add ./                      # this folder
magpie plugin add github:Hi-Jiajun/magpie-agent-varin   # or from GitHub
```

Then pick a model in Varin's row on the **Agents** page — or from the shell:

```sh
magpie varin                                  # which model it is on
magpie models varin                           # what it can pick
magpie varin group/deepseek-v4.1-flash-smart  # set it
magpie varin default                          # back to what Varin had
```

## The icon

The row wears Varin's own application icon, taken from the official AppImage
(`usr/share/icons/hicolor/1024x1024/apps/varin.png`), downscaled to 256×256 and
carried inline in `icon.js` as a `data:` URL — a magpie agent module cannot read
files, and `agent.icon` takes an icon name, an `https://` or a `data:` URL.

Magpie caches it under `~/.config/magpie/icons/<sha256-of-png>.png` and records it
in `plugin-icons.json`, so the picture survives without re-reading the plugin.

To regenerate from a local Varin install, resize that PNG to 256×256 into
`assets/icon-256.png` (e.g. with `sharp`), then rewrite `icon.js` as
`export const ICON = 'data:image/png;base64,…'`.

## The Library

`library` is what puts Varin in magpie's Library, so instructions, MCP servers and
skills can be ticked for it there. Without it magpie leaves the agent out: it is
given nothing, and ticking an item for it is refused.

```js
library: {
  instructions: '~/.config/varin/resources/AGENTS.md',
  mcp: '~/.config/varin/mcp.json',
  mcpFormat: 'claude',
  skills: '~/.config/varin/resources/skills',
}
```

These are Varin's own paths, taken from its resource resolution
(`web/server/lib/agent-resources/`), not guessed:

- `instructions` — Varin reads a context file beside its `user` resource root,
  which is `~/.config/varin/resources`.
- `mcp` — Varin's agent-level MCP file sits beside `agent-settings.json`.
- `mcpFormat: 'claude'` — Varin reads `{"mcpServers": {…}}`, the shape magpie calls
  `claude`.
- `skills` — a `skills` folder inside that same resource root.

The `resources` folder does not exist until something writes there: magpie creates
it the first time it writes an instruction or a skill for Varin.

## Keep `defaultProvider` pointed at the right channel (optional)

`defaultProvider` is a per-install UUID, and a magpie agent module cannot read
files. `varin-provider.js` ships **empty**, which writes only `defaultModel` and
leaves `defaultProvider` as it was. That is correct whenever Varin's default
channel already carries the model — the normal case, since a Magpie channel is what
lets Varin reach magpie's models at all.

If your Varin has several channels and the default is another vendor's, fill it in:

```sh
node setup.mjs        # or: npm run setup
git diff              # it rewrites a published file — review before committing
```

It reads `~/.config/varin/models.json`, finds the channel pointing at this
computer's magpie gateway, and records that channel id plus the model ids it
carries. With it filled, the plugin also keeps `defaultProvider` correct when you
pick a model.

## Known limits

- **It picks among what Varin already knows.** Varin's channel lists its models as
  a JSON array, and magpie merges object members only, so this plugin cannot add a
  model Varin does not already carry.
- **Varin reads the default when a Run starts.** Pick a model, then open a new
  conversation (or restart Varin) to use it.
- A single conversation's own model choice is not touched.

## Tested

- magpie 0.1.4093 on linux/x64, Varin 0.9.49.
- Pointer only: Windows and macOS were not tried.

MIT.
