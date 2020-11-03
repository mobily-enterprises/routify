// Routify's source code
// ======================
//
// routify.js is an unintrusive module that deals with routing and fallback
// management.
// In a nutshell, all routify.js does is set a specific attribute/property (`active`
// by default) depending on whether an element satisfies a routing pattern
// (e.g. '/view-jobs/:id'). It will also run a callback

// ## Module's variables
//
// routify.js uses some variables common to all functions: the list of
// observed elements (`elements`), a flag to know if the `installRouter` was
// already called (`routerInstalled`) and a default fallback element (`fallback`)

// Note that the router will only be installed once, globally.

const elements = { }
let routerInstalled = false

// ## Configuration options and helpers
//
// routify.js can be configured by the `setConfig` function, which will set
// keys for the module variable `config`. The configuration defines
// what attribute and property are used for:
// * `activeAttribute/activeProperty` -- elements' active flag
// * `pagePathAttribute/pagePathProperty` -- elements' paths
// * `routingGroupAttribute/routingGroupProperty` -- elements' routing groups
// * `fallbackAttribute/fallbackProperty` -- define an element as fallback
// * `routerCallbackProperty` -- elements' callback functions
// * `disableFallbackOnEvents` -- the module's suppression of fallback pages on mouse events (useful for SPAs
//   doing dynamic loading, where at click time an element might not yet be initialised
//   and the Not Found page would "flash" before the element is rendered and activated). SPAs using dynamic loading
//   must remember to do this: `if (!mod) activateCurrentPath()` if they want to display 404 for failed loading
//
// Developers can redefine these by using the `setConfig()` function:
//
//     setConfig('activeProperty', 'activated')
const config = {
  activeAttribute: 'active',
  activeProperty: 'active',
  fallbackAttribute: 'fallback',
  fallbackProperty: 'fallback',
  pagePathAttribute: 'page-path',
  pagePathProperty: 'pagePath',
  routingGroupAttribute: 'routing-group',
  routingGroupProperty: 'routingGroup'
}
export const setConfig = (key, value) => { config[key] = value }

// An element can be configured for routify.js in several different ways: via
// attributes, properties or constructors' properties.
// For example the path an element will depend on for activation can be specified
// using:
// * The attribute `page-path`
//       <page-about class="page" page-path="/page-about">...</page-about>
// * The property `pagePath`
//       <page-about id="about" class="page">...</page-about>
//       <script>window.querySelector('#about').pagePath = "/page-about"
// * The property `pagePath` in the element's constructor. Useful for litElement
// class definitions:
//       static get pagePath () { return '/page-one/:id' }
//
// The following functions are helper functions to facilitate the fetching
// of the configuration options wherever they are.

export function getPagePathFromEl (el) {
  const toArray = p => {
    return (!p || !(p.indexOf(' ') >= 0))
      ? p
      : p.split(' ')
  }

  return toArray(el.getAttribute(config.pagePathAttribute)) ||
         el[config.pagePathProperty] ||
         el.constructor[config.pagePathProperty] ||
         false
}

export function getRoutingGroupFromEl (el) {
  return el.getAttribute(config.routingGroupAttribute) ||
         el[config.routingGroupProperty] ||
         el.constructor[config.routingGroupProperty] ||
         'default'
}

export function getActiveFromEl (el) {
  return el.hasAttribute(config.activeAttribute) ||
         el[config.activeProperty] ||
         false
}

export function getFallbackFromEl (el) {
  return el.hasAttribute(config.fallbackAttribute) ||
         el[config.fallbackProperty] ||
         el.constructor[config.fallbackProperty] ||
         false
}

export function disableFallbackForGroup (group) {
  if (!elements[group]) elements[group] = { list: [], activeElement: null }
  elements[group].fallbackDisabled = true
}

export function enableFallbackForGroup (group) {
  if (!elements[group]) elements[group] = { list: [], activeElement: null }
  elements[group].fallbackDisabled = false
}

// ## Registration and activation of elements
//
// The heart of routify.js is the `registerRoute()` function, which is used to
// add an element to the list of routing" elements.
//
// To understand what `registerRoute()` does, it's important to first understand
// what `maybeActivateElement()` and `activateCurrentPath()` do.
//
// ### maybeActivateElement()
//
// `maybeActivateElement()` will check whether the browser's location matches
// the element's location pattern. If it does, it will set the activate
// attribute/property as true. The check is done using the `locationMatch()`
// function explained later.
//
// It's crucial to remember that it only works on _one_ element: it is responsible
// for _maybe_ activating _one specific_ element, where _activating_ means setting
// the active attribute/property to true.
// If the element is active, it will also set the module's `activeElement` variable
// and will attempt to run the `routerCallback()` function.
//
// Some elements might want to register for the routing callback, but _without_
// being activated. The app's main page is a prime example of this: it will want
// to know if the current page has changed in order to 'know' what page is being
// displayed (useful to highlight the right tab).
//
// This is achieved using the `disable-activation` attribute or `disableActivation`
// property, which will cause the function to detour, and only run the
// callback -- skiping any of the activation logic.
const maybeActivateElement = function (el, e) {
  const path = getPagePathFromEl(el)
  const group = getRoutingGroupFromEl(el)

  /* No path, no setting nor unsetting of `active` */
  if (!path) {
    console.error('Routing element does not have a path:', el)
    return false
  }

  // If fallback is disabled, then don't activate it

  // The element doesn't match the path: don't bother doing anything
  const locationMatchedParams = locationMatch(path)
  if (!locationMatchedParams) return
  // debugger

  if (getFallbackFromEl(el) && elements[group].fallbackDisabled) return

  if (allowSwappingActiveElementWith(el, locationMatchedParams.__PATH__)) {
    const oldActiveElement = elements[group].activeElement

    // The same element is being activated again: just update the
    // aactivating path (which may have changed) and run the routingCallback
    if (el === oldActiveElement) {
      elements[group].activeElementWithPath = locationMatchedParams.__PATH__
      callRouterCallback(el, locationMatchedParams, e)

    // The active element has changed: mark the old one as inactive, make the new
    // element as active, and run the router callback
    } else {
      if (oldActiveElement) toggleElementActive(oldActiveElement, false)
      toggleElementActive(el, true)
      elements[group].activeElement = el
      elements[group].activeElementWithPath = locationMatchedParams.__PATH__

      callRouterCallback(el, locationMatchedParams, e)
    }
    /* Return true or false, depending on the element being active or not */
    return true
  }
  return false
}

// If there is a currently active element, only allow
// toggling of the new element if the old active element is
// less specific
const allowSwappingActiveElementWith = function (el, elPath) {
  // No current element: definitely allow
  const group = getRoutingGroupFromEl(el)
  const oldActiveElement = elements[group].activeElement
  if (!oldActiveElement) return true

  // Current active element doesn't match the location: definitely allow
  const oldActiveElementPath = elements[group].activeElementWithPath
  if (!locationMatch(oldActiveElementPath)) return true

  // The currently active element is MORE specific: do NOT allow
  if (compareSpecificity(oldActiveElementPath, elPath) === 1) {
    return false
  }

  // Otherwise, return true
  return true
}

const compareSpecificity = function (a, b) {
  const firstCharacterSpecial = function (str) {
    const c = str.charAt(0)
    return c === ':' || c === '*'
  }

  // A wins if 1 is returned
  // B wins if -1 is returned
  // 0 is a draw

  const aObject = new URL(a, 'http://localhost/')
  const aTokens = aObject.pathname.split('/')

  const bObject = new URL(b, 'http://localhost/')
  const bTokens = bObject.pathname.split('/')

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const aToken = aTokens[i]
    const bToken = bTokens[i]

    // Tokens are the same: next
    if (aToken === bToken) continue

    // Whichever is longer wins
    if (aToken && typeof bToken === 'undefined') return 1
    if (bToken && typeof aToken === 'undefined') return -1

    // They both start with non-special characters: next
    if (!firstCharacterSpecial(aToken) && !firstCharacterSpecial(bToken)) continue

    // Whichever has ** loses since it's really not specific
    if (aToken === '**') return -1
    if (bToken === '**') return 1

    // Whichever has * loses
    if (aToken === '*') return -1
    if (bToken === '*') return 1
  }
  return 0
}

export const activateElement = (elementToActivate, path = '') => {
  const group = getRoutingGroupFromEl(elementToActivate)

  const list = elements[group].list

  for (const el of list) {
    // If it's not the element to activate, pass
    if (el !== elementToActivate) {
      toggleElementActive(el, false)

    // If it's the element to activate,
    } else {
      if (!getActiveFromEl(el)) {
        toggleElementActive(el, true)
        elements[group].activeElement = el
        elements[group].activeElementWithPath = path
      }
      // Call the element's callback if set. Note that the 'path'
      // can well be null
      const locationParams = locationMatch(path) || {}
      callRouterCallback(el, locationParams)
    }
  }
}

async function callRouterCallback (el, locationParams, e) {
  if (el.preRouterCallback) await el.preRouterCallback(locationParams, e)
  if (el.routerCallback) await el.routerCallback(locationParams, e)
  if (el.postRouterCallback) await el.postRouterCallback(locationParams, e)
}

// Both the functions above use this simple helper that will toggle the `active`
// attribute and property, and will emit a route-activated event if
// the route was activated

const toggleElementActive = (el, active) => {
  el[config.activeProperty] = active
  el.toggleAttribute(config.activeAttribute, active)
  if (active) el.dispatchEvent(new CustomEvent('route-activated', { details: { element: el }, bubbles: true, composed: true }))
}

// `activateCurrentPath()` will run `maybeActivateElement()`
// for each routing element in each group
//
export const activateCurrentPath = (e) => {
  for (const group of Object.keys(elements)) {
    const list = elements[group].list
    for (const el of list) {
      maybeActivateElement(el, e)
    }
  }
}

// ### Registering routes
//
// The heard of routify.js is the `registerRoute()` function, which will
// turn an HTML element in the page into a location-aware element that will
// activate itself when the browser's path matches the element's path template.
//
// This function has two very distinct parts; in the first part, a router function
// is installed. In the second part, the element is actually registered.
//
// ## The first part
//
// In order for routify.js to work, it needs to intercept mouse clicks so that
// rather than changing page (and triggering a full reload), a callback
// is called. This is achieved by the `installRoute` function, _strongly_ inspired
// by the `routing.js` file in the `pwa-helpers` package by the Polymer team.
// Note that in an application the router must only be installed once. So,
// `installRoute()` is called only the first time `registerRoute()` is called.
//
// The function `activeCurrentPath` is run every time there is a location
// change. This will ensure that the correct element is marked as active -- and
// more crucially that other non-matching elements are not active.
//
// ## The second part
//
export function registerRoute (el) {
  const group = getRoutingGroupFromEl(el)

  /* Create the element group if it doesn't exist already */
  if (!elements[group]) elements[group] = { list: [], activeElement: null }

  /* Install the GLOBAL router -- if it's not already installed */
  if (!routerInstalled) {
    installRouter((location, e) => {
      activateCurrentPath(e)
    })
    routerInstalled = true
  }

  /* Register element, checking that it's not already registered */
  if (el.__routingRegistered) {
    console.error('WARNING. Element has registered twice for routing:', el.tagName)
  }
  el.__routingRegistered = true

  /* Push the element to the list of elements in this group */
  elements[group].list.push(el)

  /* MAYBE activate the element. */
  maybeActivateElement(el, null)
}

export function registerRoutesFromSelector (root, selector) {
  for (const el of root.querySelectorAll(selector)) {
    const group = getRoutingGroupFromEl(el)
    if (!elements[group]) elements[group] = { list: [], activeElement: null }
    if (!elements[group].list.find(item => item === el)) registerRoute(el)
  }
}

export function unregisterRoute (el) {
  const group = getRoutingGroupFromEl(el)

  if (!elements[group]) return

  elements[group].list = elements[group].list.filter(item => item !== el)
}

export function unregisterRoutesFromSelector (root, selector) {
  for (const el of root.querySelectorAll(selector)) {
    const group = getRoutingGroupFromEl(el)
    if (!elements[group]) return
    unregisterRoute(el)
  }
}

// This function is _extremely_ inspired by the `installRouter` function found
// in the [pwa-helpers](https://www.npmjs.com/package/pwa-helpers) package by
// the Polymer team.
// It's the original source but linted, reformatted from typescript, and fully commented.
//
// The main aim of installRouter is to define a callback that will be called
// every time the URL changes. This is achieved by listening to the `click` event:
// when a "normal" link is clicked, `preventDefault()` is called and the location
// is artificially added to the browser's history with a pushState call.
const installRouter = (locationUpdatedCallback) => {
  /* Listen for the click event */
  document.body.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return

    /* Check that the clicked element is indeed a "pure" link (no */
    /* 'download' or rel=external attribute */
    const anchor = e.composedPath().filter(n => n.tagName === 'A')[0]
    if (!anchor || anchor.target || anchor.hasAttribute('download') || anchor.getAttribute('rel') === 'external') return

    /* Check that it does have href, and it's not a mailto: link */
    const href = anchor.href
    if (!href || href.indexOf('mailto:') !== -1) return

    /* Check that it's a local link */
    const location = window.location
    const origin = location.origin || location.protocol + '//' + location.host
    if (href.indexOf(origin) !== 0) return

    /* We are in business: prevent the browser from leaving the page, */
    /* and -- if the link has changed -- push the new location to the */
    /* browser's history */
    e.preventDefault()
    if (href !== location.href) {
      const state = { artificial: true }

      window.history.pushState(state, '', href)

      /* If a link was pressed, then the history has changed and */
      /* a popstate event should be called */
      /* The `artificial` property in the state will potentially tell */
      /* listeners that this wasn't a proper "pure" browser event (that is, */
      /* it wasn't the result of a user clicking on a button) */
      emitPopstate({ state })
    }
  })

  /* Make sure the passed callback is called when the history changes. The */
  /* emitPopState call above will trigger this */
  window.addEventListener('popstate', e => locationUpdatedCallback(window.location, e))

  /* Artificially call the callback at installation time. This is important so that */
  /* developers using this function can do one-off setups  */
  // locationUpdatedCallback(window.location, null)
}

// The `installRouter()` function makes sure that the correct callback is called
// whenever a user clicks on a link.
//
// Changing the location programmatically with `window.history.pushState()` or
// `window.history.replaceState()` won't trigger the update callback -- which
// means that routing won't respond.
// In order to change location programmatically, after `pushState()` or `replaceState()`
// an SPA needs using routify.js will need to manually emit a `popstate`
// event. This function does just that:
//
export function emitPopstate (state) {
  let e
  if (state) e = new PopStateEvent('popstate', state)
  else e = new PopStateEvent('popstate')
  window.dispatchEvent(e)
}

// ### Location matching
//
// This is a simple function that will check if a template URL matches with
// `window.location`.
//
// It's very basic, and it might eventually be replaced with something more
// complex (although client-side routing doesn't tend to need complex
// routing paths)
//
// The allowed syntax is:
//
// * `/something`
// * `/something/:page`
// * `/something/whatever/:page`
// * `/something/*`
// * `/something/:page/*`
//
// Both `*` and `:` character will match anything (as long as it's not empty).
// The main difference is what the function returns: for `:` routes, if there is
// a match, `locationMatch` will return an object where every key is the matching
// `:key`.
//
// For example if the location is `/record/10` and the template is
// `/record/:id`, this function will return `{ id: 10 }`
//
export function locationMatch (templateUrl, checker) {
  if (!templateUrl) return
  const locationMatchExecutor = (templateUrl, checker) => {
    //
    // Prepare the basic variables
    const templateUrlObject = new URL(templateUrl, 'http://localhost/')
    const templatePath = templateUrlObject.pathname.split('/')
    const browserUrlObject = window.location
    const browserPath = browserUrlObject.pathname.split('/')

    if (templatePath.length !== browserPath.length) return false

    // Check the hash -- if present or marked as "must be empty"
    const templateHash = (templateUrlObject.hash || '#').substr(1)
    const browserHash = (browserUrlObject.hash || '#').substr(1)
    const templateHashEmpty = templateUrl.endsWith('#')
    let hashMatching = true
    if (templateHash || templateHashEmpty) {
      if (templateHashEmpty && browserHash) hashMatching = false
      else if (templateHash === '*' && browserHash) hashMatching = true
      else hashMatching = templateHash === browserHash
    }
    if (!hashMatching) return false

    // Check the callbacks
    const callbackParams = {}
    for (let i = 0, l = templatePath.length; i < l; i++) {
      if (templatePath[i].startsWith(':')) {
        callbackParams[templatePath[i].substr(1)] = browserPath[i]
      } else {
        // If the template accepts anything, and the browser has something,
        // skip the next check
        if (templatePath[i] === '*' && browserPath[i]) continue

        if (templatePath[i] === '**') break

        if (templatePath[i] !== browserPath[i]) return false
      }
    }
    callbackParams.__PATH__ = templateUrl

    // No param checker: return true, since parameters won't need checking
    if (!checker) return callbackParams

    // Checker is there: if it passes, return the found params. Otherwise, fail
    if (checker(callbackParams)) return callbackParams
    else return false
  }

  if (!Array.isArray(templateUrl)) return locationMatchExecutor(templateUrl, checker)
  else {
    for (const templateUrlElement of templateUrl) {
      const r = locationMatchExecutor(templateUrlElement, checker)
      if (r) return r
    }
    return false
  }
}
