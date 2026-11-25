'use strict';
// The single application router.
//
// Before this file, three separate listeners (legacy skill library popstate, Studio popstate and
// Studio hashchange) each re-rendered the page, so one Back press could render up to three times,
// and the legacy startup restore could overwrite Studio routes. Now:
//  - exactly one popstate/hashchange listener exists;
//  - the same URL is never dispatched twice in a row (a hash Back fires both events);
//  - in-app pushState/replaceState calls are tracked, so Back always dispatches;
//  - one resolver (registered by Studio, loaded last) decides what to render.
const AppRouter = (() => {
  let resolver = null;
  let last = null;
  let started = false;
  const current = () => location.pathname + location.search + location.hash;
  // Legacy scripts render (and sometimes rewrite the URL) while loading. Remember the URL the
  // visitor actually opened, and restore it before the first dispatch.
  const opened = current();
  for (const method of ['pushState', 'replaceState']) {
    const original = history[method].bind(history);
    history[method] = (...args) => {
      original(...args);
      last = current();
    };
  }
  function dispatch(force) {
    if (!resolver || !started) return;
    const url = current();
    if (!force && url === last) return;
    last = url;
    resolver();
  }
  addEventListener('popstate', () => dispatch(false));
  addEventListener('hashchange', () => dispatch(false));
  return {
    /** Register the function that renders the current URL. */
    setResolver(fn) {
      resolver = fn;
    },
    /** Render the URL the page was opened with. */
    start() {
      started = true;
      if (current() !== opened) history.replaceState(history.state, '', opened);
      dispatch(true);
    },
    /** Navigate to an in-app hash and render it. */
    go(hash, { replace = false } = {}) {
      if (location.hash !== hash)
        history[replace ? 'replaceState' : 'pushState'](null, '', location.pathname + hash);
      dispatch(true);
    },
    /** 'full' | 'playroom' | null — the optional legacy libraries kept for free play. */
    libraryView() {
      const view = new URLSearchParams(location.search).get('library');
      return view === 'full' || view === 'playroom' ? view : null;
    },
    /** The URL the visitor opened, before any legacy script rewrote it. */
    get opened() {
      return opened;
    },
    get started() {
      return started;
    }
  };
})();
