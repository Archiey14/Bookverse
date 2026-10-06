// Helpers for the storefront's URL state.
//
// The books page keeps its filters in the address bar so every view can be
// linked, bookmarked and reached with the browser's back button:
//
//   /?collection=bestsellers
//   /?category=Fiction
//   /?q=atomic
//
// `all` and `All Books` are the defaults, so they never appear in the URL.

const DEFAULTS = new Set(["", "all", "All Books"]);

export function buildParams(values = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value && !DEFAULTS.has(value)) params.set(key, value);
  }

  return params;
}

// shopPath({ category: "Fiction" }) -> "/?category=Fiction"
export function shopPath(values = {}) {
  const search = buildParams(values).toString();
  return search ? `/?${search}` : "/";
}
