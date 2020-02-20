// Routify's source code
// ======================
//
// routify is an unintrusive module that deals with routing and fallback
// management.
// In a nutshell, all routify does is set a specific attribute/property (`active`
// by default) depending on whether an element satisfies a routing pattern
// (e.g. '/view-jobs/:id'). It will also run a callback

// ## Module's variables
//
// routify uses some variables common to all functions: the list of
// observed elements (`elements`), a flag to know if the `installRouter` was
// already called (`routerInstalled`) and a default fallback element (`fallback`)

const elements = []
let routerInstalled = false
let fallback = null
let activeElement = null

// ## Configuration options and helpers
//
// routify can be configured by the `setConfig` function, which will set
// keys for the module variable `config`. The configuration defines
// what attribute and property are used for:
// * elements' active flag
// * elements' paths
// * define an element as fallback
// * disable activation for the element, used for the main page
// * elements' callback functions
//
// Developers can redefine these by using the `setConfig()` function:
//
//     setConfig('activeProperty', 'activated')
const config = {
  activeAttribute: 'active',
  activeProperty: 'active',
  pathAttribute: 'page-path',
  pathProperty: 'pagePath',
  fallbackAttribute: 'fallback',
  fallbackProperty: 'fallback',
  disableActivationAttribute: 'disable-activation',
  disableActivationProperty: 'disableActivation',
  routerCallbackProperty: 'routerCallback'
}
export const setConfig = (key, value) => { config[key] = value }

// An element can be configured for routify in several different ways: via
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

export function pagePathFromEl (el) {
  return el.getAttribute(config.pathAttribute) ||
         el[config.pathProperty] ||
         el.constructor[config.pathProperty] ||
         false
}

export function getFallbackFromEl (el) {
  return el.getAttribute(config.fallbackAttribute) !== null ||
         el[config.fallbackProperty] ||
         el.constructor[config.fallbackProperty] ||
         false
}

export function getDisableActivationFromEl (el) {
  return el.getAttribute(config.disableActivationAttribute) !== null ||
         el[config.disableActivationProperty] ||
         el.constructor[config.disableActivationProperty] ||
         false
}

// ## Registration and activation of elements
//
// The heart of routify is the `registerRoute()` function, which is used to
// add an element to the list of routing" elements.
//
// To understand what `registerRoute()` does, it's important to first understand
// what `activateCurrentPath()` and `maybeActivateElement()` do.
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
const maybeActivateElement = function (el) {
  const path = pagePathFromEl(el)

  /* No path, no setting nor unsetting of `active` */
  if (!path && el !== fallback) {
    console.error('Routing element does not have a path:', el)
    return false
  }

  const activationDisabled = getDisableActivationFromEl(el)
  const isActiveWithParams = locationMatch(path)

  /* Detour: activation is disabled. Just run the callback if present */
  /* and just return false, since item wasn't activated */
  if (activationDisabled && isActiveWithParams && el[config.routerCallbackProperty]) {
    el[config.routerCallbackProperty](isActiveWithParams, location, null)
    return false
  }

  /* Toggle the active property/attribute */
  toggleElementActive(el, !!isActiveWithParams)

  /* If active, call the callback (if present) AND set the element as "the"
  /* currently active  element */
  if (isActiveWithParams) {
    if (el[config.routerCallbackProperty] && el !== activeElement) el[config.routerCallbackProperty](isActiveWithParams, location, null)
    if (!activationDisabled) activeElement = el
  }

  /* Return true or false, depending on the element being active or not */
  return !!isActiveWithParams
}

// `maybeActivateElement()` only deals with one specific element,
// `activateCurrentPath()`, on the other hand, will run `maybeActivateElement()`
// for each routing element (that is, every element in the `elements` array).
// More crucially, it will set the fallback element as active if
// no active elements were found.
//
const activateCurrentPath = (e) => {
  if (!elements.length) return

  activeElement = null
  let oneActive = false
  for (const el of elements) {
    const isActive = maybeActivateElement(el)
    oneActive = oneActive || isActive
  }
  if (fallback) {
    const fallbackActive = !oneActive
    toggleElementActive(fallback, fallbackActive)
    if (fallbackActive && fallback[config.routerCallbackProperty]) fallback[config.routerCallbackProperty](location, null)
  }
}

// Both the functions above use this simple helper that will toggle the `active`
// attribute and property, and will emit a route-activated event if
// the route was activated

const toggleElementActive = (el, active) => {
  el[config.activeProperty] = active
  el.toggleAttribute(config.activeAttribute, active)
  if (active) el.dispatchEvent(new CustomEvent('route-activated', { details: { element: el }, bubbles: true, composed: true }))
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
// In order for Routify to work, it needs to intercept mouse clicks so that
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
// The second part of the function is run immediately: here, the registered
// element is pushed into the `elements` array. The global variable `fallback` is
// also set if the element is indeed the fallback one (that is, it has the
// correct attribute/property set).
//
// Once the element is added, the system needs to be check whether it's active
// or not. Running `activateCurrentPath()` definitely works. However, it would
// be an overkill, since each element in the (growing) `elements` array will be
// checked each tim after registering a new element.
//
// If there is no fallback defined, `maybeActivateElement(el)`
// (which focuses on the element itself) is enough, since it can safely be assumed
// that the page's location will stay the same between calls.
// However, if a fallback is defined, then `activateCurrentPath()` is needed since
// it's the only function that will set the fallback as active if necessary (that's
// because it's impossible to know if none of the elements are active unless
// they are all checked).
//
// This is why it's ideal, for performance, to define fallback pages last.
// Another function, `registerRoutesFromSelector()`, is provided to
// mass-register all elements satisfying a specific selector.

export function registerRoute (el) {
  if (!routerInstalled) {
    installRouter(async (location, e) => {
      activateCurrentPath(e)
    })
    routerInstalled = true
  }

  if (!fallback && getFallbackFromEl(el)) fallback = el
  elements.push(el)

  if (!fallback) {
    maybeActivateElement(el)
  } else {
    activateCurrentPath(null)
  }
}

export function registerRoutesFromSelector (root, selector) {
  for (const el of root.querySelectorAll(selector)) {
    if (!elements.find(item => item === el)) registerRoute(el)
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
      window.history.pushState({}, '', href)
      locationUpdatedCallback(location, e)
    }
  })

  /* Make sure the passed callback is called when the history changes. The */
  /* pushState call above will indeed make this happen */
  window.addEventListener('popstate', e => locationUpdatedCallback(window.location, e))

  /* Artificially call the callback at installation time. This is important so that */
  /* developers using this function can do one-off setups  */
  locationUpdatedCallback(window.location, null)
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
  const e = new PopStateEvent('popstate', { state })
  window.dispatchEvent(e)
}

// ### Location matching
//
// This is a simple function that will
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

        if (templatePath[i] !== browserPath[i]) return false
      }
    }

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
