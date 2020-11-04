// Routify's source code
// ======================
//
// routify.js is an unintrusive module that deals with routing
// In a nutshell, all routify.js does is set a specific attribute/property (`active`
// by default) depending on whether an element satisfies a routing pattern
// (e.g. '/view-jobs/:id'). It will also run a callback ('routerCallback') whenever
// the routing matches, so that pages can do whatever they are supposed to do when
// they become visible.
//
// A page can match multiple paths. Also, paths can contain wild characters:
//
// * `/preferences/*/large` -- will match `/preferences/user/large` and
//   `/preferences/company/large`. Basicaly, `*` will match one word anywhere in the path
// *  `/view/**` -- will match `/view/one/two/three` and `/view/whatever`. Basically,
//    `**` will match anything regardless of what follows.
//
// A page will belong to a "routing group".
// Most applications will have one main routing group (e.g. `/likes`, `/account`, etc).
// However, another group might be `/account/settings`, `/account/photo`, and so on.
// Only one page at a time will be active in any given group.
//
// ## Module's variables
//
// These are the module's global state.
// `elements` is the list of observed elements; `routerInstalled` is a global
// flag that signals that the global router was already installed. The router is
// installed once, globally, when the first route is registered.
//

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
//
// Developers can redefine these by using the `setConfig()` function. For example,
// developers can configure routify so that the attribute `activated` is
// added to a matching element like this:
//
//     setConfig('activeAttribute', 'activated')
const config = {
  activeAttribute: 'active',
  activeProperty: 'active',
  pagePathAttribute: 'page-path',
  pagePathProperty: 'pagePath',
  routingGroupAttribute: 'routing-group',
  routingGroupProperty: 'routingGroup'
}
export const setConfig = (key, value) => { config[key] = value }

// An element can be configured for routify.js in several different ways: via
// attributes (to the HTML element), properties or constructors' properties.
// For example the path an element will depend on for activation can be specified
// using:
// * The attribute `page-path`
//       <page-about class="page" page-path="/page-about">...</page-about>
// * The property `pagePath`
//       <page-about id="about" class="page">...</page-about>
//       <script>window.querySelector('#about').pagePath = "/page-about"
// * The property `pagePath` in the element's constructor. Useful for ES6's
// class definitions:
//       static get pagePath () { return '/page-one/:id' }
//
// The following functions are helper functions to facilitate the fetching
// of the configuration options wherever they are, returning sane defaults,
// for the attributes/properties `active`, `page-path/pagePath` and
// `routing-group/routingGroup`

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

// ### Registering routes
//
// The heart of routify.js is the `registerRoute()` function, which will
// turn an HTML element in the page into a location-aware element that will
// activate itself when the browser's path matches the element's path template.
//
// This function has two very distinct parts; in the first part, a global router
// function is installed if it weren't already installed. You can see this as a
// once-only, on the spot operation to make sure that clicks are intercepted
// globally. In the second part, the element is actually registered as it's added to
// the `elements` global variable and it's "maybe" activated (it depends on whether
// the app location does satisfy the route).
//
// The attempted activation is important: it means that registering all routes
// automatically means that the matching ones will be activated.
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

// Simple apps might just have small amounts of javascript sprinkled around.
// They can use `registerRoutesFromSelector()` to register all elements
// matching a selector.

export function registerRoutesFromSelector (root, selector) {
  for (const el of root.querySelectorAll(selector)) {
    const group = getRoutingGroupFromEl(el)
    if (!elements[group]) elements[group] = { list: [], activeElement: null }
    if (!elements[group].list.find(item => item === el)) registerRoute(el)
  }
}

// `activateCurrentPath()` will run `maybeActivateElement()`
// for each routing element in each group.
// The function above `registerRoute()` will call this function
// every time there is a mouse click on a link. This will ensure
// that the right element is active in each group -- in other words, it will
// ensure that the right pages are shown.
//
export const activateCurrentPath = (e) => {
  for (const group of Object.keys(elements)) {
    const list = elements[group].list
    for (const el of list) {
      maybeActivateElement(el, e)
    }
  }
}

// ### maybeActivateElement()
//
// `maybeActivateElement()` will check whether the browser's location matches
// the element's location pattern. If it does, it will set the activate
// attribute/property as true. The check is done using the `locationMatch()`
// function explained later.
//
const maybeActivateElement = function (el, e) {
  const path = getPagePathFromEl(el)
  const group = getRoutingGroupFromEl(el)

  /* No path, no setting nor unsetting of `active` */
  if (!path) {
    console.error('Routing element does not have a path:', el)
    return false
  }

// The first step is checking whether the element's path matches the
// window's path. If it doesn't, there is nothing to do.
  const locationMatchedParams = locationMatch(path)
  if (!locationMatchedParams) return
  debugger

// Matching a path is not enough. Keep in mind that `activateCurrentPath()`
// will go through _every_ element in the group. So, while `/account` might well
// be a match, `/**` (likely to be the "File not found" page) will also be
// a match -- therefore the "Not found" one will always win.
// Also, the "Not found" element will always win when elements are being registered
// if it's the last one in the DOM. For this reason, it's crucial to check if
// swapping is "allowed".
//
// The `allowSwappingActiveElementWith()` function does exactly this: it
// checks whether `el`, which was matched with the path `__PATH__` (from `locationMatch()`),
// is more specific than the currently active element. If it is, it
// will be swapped. If it's not, `maybeActivateElement()` won't activate it.
//
// In other words, `maybeActivateElement()` will only activate an element
// if it's more specific than the element currently active.
// Again, since an element might have multuple paths, it's important to store
// the path that actually matched when the element was active
//
  if (allowSwappingActiveElementWith(el, locationMatchedParams.__PATH__)) {
    const oldActiveElement = elements[group].activeElement

    /* The same element is being activated again: just update the */
    /* aactivating path (which may have changed) and run the routingCallback */
    if (el === oldActiveElement) {
      elements[group].activeElementWithPath = locationMatchedParams.__PATH__
      callRouterCallback(el, locationMatchedParams, e)

    /* The active element has changed: mark the old one as inactive, make the new */
    /* element as active, and run the router callback */
    /* Note that routify NEEDS to know the path that made the element match */
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

// This is the implementation of `allowSwappingActiveElementWith()`.
// Keep in mind that a page might have multiple paths. However, in this context,
// routify will compare:
//
// * the specificity of the path that actually matched the
// element (returned by `locationMatch()` as `locationMatchedParams.__PATH__`)
// * with the specificity of the path matched in the currently active element
// (in `elements[group].activeElementWithPath`).
//
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

// The function to compare specificity is really simple: it will take
// the paths `a` and `b` and:
// * return 1 if `a` wins
// * return -1 if `b` wins
// * return 0  if it is a draw
//
const compareSpecificity = function (a, b) {
  const firstCharacterSpecial = function (str) {
    const c = str.charAt(0)
    return c === ':' || c === '*'
  }

  const aObject = new URL(a, 'http://localhost/')
  const aTokens = aObject.pathname.split('/')

  const bObject = new URL(b, 'http://localhost/')
  const bTokens = bObject.pathname.split('/')

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const aToken = aTokens[i]
    const bToken = bTokens[i]

    /* Tokens are the same: next */
    if (aToken === bToken) continue

    /* Whichever is longer wins */
    if (aToken && typeof bToken === 'undefined') return 1
    if (bToken && typeof aToken === 'undefined') return -1

    /* They both start with non-special characters: next */
    if (!firstCharacterSpecial(aToken) && !firstCharacterSpecial(bToken)) continue

    /* Whichever has ** loses since it's really not specific */
    if (aToken === '**') return -1
    if (bToken === '**') return 1

    /* Whichever has * loses */
    if (aToken === '*') return -1
    if (bToken === '*') return 1
  }
  return 0
}

// Sometimes it's necessary for a program to force the activation
// of a route, even if it doesn't match a path.
// This is what this function is for
// In a real-world scenario, an SAP that loads modules dynamically can't
// have a "catch-all" `/**` as a fallback, since it will flash as active
// while the actual module is loaded. In this case, developers will have to
// avoid defining a catch-all callback, and activate the "Not found" page
// by hand
export const activateElement = (elementToActivate, path = '') => {
  const group = getRoutingGroupFromEl(elementToActivate)

  const list = elements[group].list

  for (const el of list) {
    /* If it's not the element to activate, pass */
    if (el !== elementToActivate) {
      toggleElementActive(el, false)

    /* If it's the element to activate, do so */
    /* Note that the matching path is also stored if it's passed*/
    } else {
      if (!getActiveFromEl(el)) {
        toggleElementActive(el, true)
        elements[group].activeElement = el
        elements[group].activeElementWithPath = path
      }
      /* Call the element's callback if set. Note that the 'path' */
      /* can well be null */
      const locationParams = locationMatch(path) || {}
      callRouterCallback(el, locationParams)
    }
  }
}

// This is a utility function to call preRouterCallback, routerCallback
// and  postRouterCallback
async function callRouterCallback (el, locationParams, e) {
  if (el.preRouterCallback) await el.preRouterCallback(locationParams, e)
  if (el.routerCallback) await el.routerCallback(locationParams, e)
  if (el.postRouterCallback) await el.postRouterCallback(locationParams, e)
}

// This is a simple helper that will toggle the `active`
// attribute and property, and will emit a route-activated event if
// the route was activated
const toggleElementActive = (el, active) => {
  el[config.activeProperty] = active
  el.toggleAttribute(config.activeAttribute, active)
  if (active) el.dispatchEvent(new CustomEvent('route-activated', { details: { element: el }, bubbles: true, composed: true }))
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
// an SPA using routify.js will need to manually emit a `popstate`
// event. This function does just that:
//
export function emitPopstate (state) {
  let e
  if (state) e = new PopStateEvent('popstate', state)
  else e = new PopStateEvent('popstate')
  window.dispatchEvent(e)
}

// Finally, a route can un unregistered. These functions are provided for
// completeness, as their use will be very much edge cases

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
// * `/something/**`
//
// Both `*` and `:` character will match anything (as long as it's not empty).
// The main difference is what the function returns: for `:` routes, if there is
// a match, `locationMatch` will return an object where every key is the matching
// `:key`. For example if the location is `/record/10` and the template is
// `/record/:id`, this function will return `{ id: 10 }`
//
// Also, `**` should be at the end of a URL, to match "anything that follows"
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
