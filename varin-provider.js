// Machine-specific values, filled by ./setup.mjs. Shipped empty on purpose.
//
// Empty: the plugin writes only `defaultModel` and leaves `defaultProvider` as it
// was, which is correct whenever Varin's channel already carries the model — the
// normal case, since a Magpie channel is what lets Varin reach magpie's models.
//
// Filled: the plugin also keeps `defaultProvider` pointing at the right channel,
// which matters when Varin has several channels and the default is another vendor's.
export const PROVIDER_ID = ''
export const KNOWN_MODELS = new Set()
