// magpie agent plugin — Varin (https://github.com/Astrmira/Varin)
//
// Varin keeps its conversation default in one plain JSON file:
//
//   ~/.config/varin/agent-settings.json
//   { "defaultProvider": "<channel uuid>", "defaultModel": "<model id>",
//     "defaultThinkingLevel": "high" }
//
// `defaultModel` is the model id exactly as Varin's own model channel lists it
// (Varin's Magpie channel already speaks the gateway's model ids), so magpie
// only has to write that one key. `defaultProvider` has to name the channel the
// model belongs to, and that id is a per-install UUID: it is carried in
// ./varin-provider.js because a magpie agent module cannot read files.
//
// Scope, honestly: this picks among the models Varin's channel already carries.
// It cannot add a model Varin does not know, because the channel's model list is
// a JSON array and magpie only merges object members.

import { PROVIDER_ID, KNOWN_MODELS } from './varin-provider.js'
import { ICON } from './icon.js'

export const agent = {
  id: 'varin',
  name: 'Varin',
  bin: 'varin',
  dir: '~/.local/opt/varin',
  config: '~/.config/varin/agent-settings.json',
  format: 'json',
  model: 'defaultModel',
  ua: ['varin'],
  icon: ICON,
  // Without this, magpie leaves the agent out of the Library: it is given nothing
  // from it, and ticking an item for it is refused. Paths come from Varin's own
  // resource resolution (web/server/lib/agent-resources/authority.js):
  //   instructions — an AGENTS.md beside the `user` resource root
  //   mcp          — the agent-level mcp.json beside agent-settings.json
  //   skills       — a `skills` folder inside that same resource root
  // Varin reads {"mcpServers": {…}}, which is magpie's `claude` mcpFormat.
  library: {
    instructions: '~/.config/varin/resources/AGENTS.md',
    mcp: '~/.config/varin/mcp.json',
    mcpFormat: 'claude',
    skills: '~/.config/varin/resources/skills',
  },
  notice: 'Varin reads its default model when a Run starts: open a new conversation (or restart Varin) to use the new model.',
}

export function connect({ model }) {
  const id = model?.id

  // Steer `defaultProvider` only when both hold: this install recorded its channel
  // in varin-provider.js (see setup.mjs), and the picked model is one that channel
  // really carries. Magpie also calls connect() while previewing a pick, with a
  // model Varin may not have; writing the channel id for such an id would pair a
  // provider with a model it does not serve. Varin then falls back to that
  // provider's first model instead of the one you picked.
  //
  // Empty (a fresh install): return nothing, so magpie writes `defaultModel` alone
  // and Varin keeps the provider it already had.
  if (!PROVIDER_ID || id === undefined || !KNOWN_MODELS.has(id)) return {}
  return { defaultProvider: PROVIDER_ID }
}
