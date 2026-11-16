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
writes that one key and nothing else. Switching off puts the file back as it was,
key by key; magpie never rewrites it whole.

## Install

```sh
magpie plugin add github:Hi-Jiajun/magpie-agent-varin
# or, from a clone: magpie plugin add ./
```

Then pick a model in Varin's row on the **Agents** page — or from the shell:

```sh
magpie varin                                  # which model it is on
magpie models varin                           # what it can pick
magpie varin group/deepseek-v4.1-flash-smart  # set it
magpie varin default                          # back to what Varin had
```

Varin reads its default when a Run starts: open a new conversation (or restart
Varin) to use the new model.

## The Library

The `library` block in `varin.agent.js` is what puts Varin in magpie's Library, so
instructions, MCP servers and skills can be ticked for it there. Without it magpie
leaves the agent out: it is given nothing, and ticking an item for it is refused.

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

## The icon

The row wears Varin's own application icon, taken from the official AppImage
(`usr/share/icons/hicolor/1024x1024/apps/varin.png`), downscaled to 256×256 and
carried inline as a `data:` URL. An agent module runs on moejs — one file, no
imports, no file reads — so the icon cannot be a path on disk.

magpie caches it under `~/.config/magpie/icons/<sha256-of-png>.png` and records it
in `plugin-icons.json`, so the picture survives without re-reading the plugin.

## `defaultProvider` is left alone (by design)

`defaultProvider` is a per-install UUID, and this module cannot read
`models.json` to discover it. So `connect()` returns nothing and magpie writes only
`defaultModel`; Varin keeps the channel it already had. That is correct whenever
Varin's default channel already carries the model — the normal case, since a Magpie
channel is what lets Varin reach magpie's models at all.

If your Varin has several channels and the default is another vendor's, fill the
two constants at the top of `varin.agent.js`:

```js
const PROVIDER_ID = '<id of the channel whose baseUrl is your magpie gateway>'
const KNOWN_MODELS = new Set(['group/…', …])   // the ids that channel carries
```

Both come from `~/.config/varin/models.json`. With them filled, `connect()` also
keeps `defaultProvider` pointing at the right channel. `connect()` still writes
nothing for a model that set does not contain, because magpie also calls it while
previewing a pick — writing the channel id there would pair a provider with a model
it does not serve.

## Known limits

- **It picks among what Varin already knows.** Varin's channel lists its models as
  a JSON array, and magpie merges object members only, so this plugin cannot add a
  model Varin does not already carry.
- A single conversation's own model choice is not touched.

## Tested

- magpie 0.1.4093 on linux/x64, Varin 0.9.49.
- Switching models writes only `defaultModel`; the rest of `agent-settings.json`
  (including `harness.permissions`) is left byte-identical, and `magpie varin
  default` puts it back.
- Library: magpie lists `varin` against every MCP server and skill, and writes them
  into `~/.config/varin/mcp.json` and `~/.config/varin/resources/skills/`.
- The icon: magpie cached it under `icons/` with a matching sha256.
- Windows and macOS were not tried.

```sh
bun test     # 4 tests
```

MIT.
