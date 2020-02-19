// routify is an unintrusive module that deals with routing and fallback
// management.
// In a nutshell, all routify does is set a specific attribute/property (`active`
// by default) depending on whether an element satisfies a routing pattern
// (e.g. '/view-jobs/:id'). It will also run a callback
//
// Routify is based on the `installRouter()` function provided by the pwa-helpers
// by the Polymer authors.
// The main aim of installRouter is to define a callback that will be called
// every time the URL changes. This is achieved by listening to the `click` event:
// when a "normal" link is clicked, `preventDefault()` is called and the location
// is artificially added to the browser's history with a pushState call.
// To change the location programmatically, therefore, you need to push a new
// state using `pushState()` and call the callback manually:
//
//    window.history.pushState({}, '', '/new-route');
//    handleNavigation(window.location);
import { installRouter } from 'pwa-helpers/router.js'

// routify uses some variables common to all functions: the list of
// observed elements (`elements`), a flag to know if the `installRouter` was
// already called (`routerInstalled`) and a default fallback element (`fallback`)
const elements = []
let routerInstalled = false
let fallback = null
let activeElement = null

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

// The `registerRoute()` function is used to add an element to the list of
// "routing" elements.
// The function has two very distinct parts; in the first part, a router function
// is installed. In the second part, the element is actually registered.
//
// Before reading on, it's important to understand what `activateCurrentPath()`
// and `maybeActivateElement() do.`
//
// `maybeActivateElement()` is responsible for _maybe_ activating an element,
// where _activating_ means setting the active attribute to true. This
// function only works on _one_ element. Crucially, if the element is active,
// it will attempt to run the `routerCallback()` function and
// set the global `activeElement` variable as that element.
//
// `activateCurrentPath()` on the other hand will run `maybeActivateElement()`
// for each routing element (that is, every element in the `elements` array).
// More crucially, it will set the fallback element as active if
// no active elements were found.
//
// ## The first part
//
// In order for Routify to work, it needs to intercept mouse clicks so that
// rather than changing page (and triggering a full reload), a callback
// is called. This is achieved by the `installRoute` function by the Polymer team.
// Note that in an application the router must only be installed once. Rather
// than forcing developers to run an initialisation function, it's best to
// install the router when `registerRoute()` is called.
//
// The function `activeCurrentPath` is run every time there is a route
// change. This will ensure that the correct page is marked as active.
//
// # The second part
//
// The second part of the function is run immediately: here, the registered
// element is pushed into the `element` array. The global variable `fallback` is
// also set if the element is indeed the fallback one (that is, it has the
// correct attribute set).
//
// Once the element is added, the system needs to be check whether it's active
// or not. Running `activateCurrentPath()` definitely works. However, it would
// be an overkill, since each path will be checked again after registering
// each new element. If there is no fallback defined, `maybeActivateElement(el)`
// (which focuses on the element itself) is enough. However, if a fallback is
// defined, then `activateCurrentPath()` is needed. This is why it's ideal to
// define fallback pages last.
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

const maybeActivateElement = function (el) {
  const path = pagePathFromEl(el)

  // No path, no setting nor unsetting of `active`
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

export function activateCurrentPath (e) {
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

const toggleElementActive = (el, active) => {
  el[config.activeProperty] = active
  el.toggleAttribute(config.activeAttribute, active)
  if (active) el.dispatchEvent(new CustomEvent('route-activated', { details: { element: el }, bubbles: true, composed: true }))
}

export function registerRouteFromSelector (root, selector) {
  for (const el of root.querySelectorAll(selector)) {
    if (!elements.find(item => item === el)) registerRoute(el)
  }
}

export function pagePathFromEl (el) {
  return el.getAttribute(config.pathAttribute) || el[config.pathProperty] || el.constructor[config.pathProperty] || false
}

export function getFallbackFromEl (el) {
  return el.getAttribute(config.fallbackAttribute) !== null || el[config.fallbackProperty] || el.constructor[config.fallbackProperty] || false
}

export function getDisableActivationFromEl (el) {
  return el.getAttribute(config.disableActivationAttribute) !== null || el[config.disableActivationProperty] || el.constructor[config.disableActivationProperty] || false
}

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
