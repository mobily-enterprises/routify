# routify.js API

**registerRoute (el)**

The element `el` is registered as a valid route. The element's route is set by the attribute `page-path` or property `pagePath`.
Once an element is registered, its `active` property _and_ attribute are set to true **if** the browser's location matches the element's path; there are two exceptions to this rule:

* if the element has the `disable-activation` attribute or the `disableActivation` property, the `active` property/attribute is untouched

* if the element has the `fallback` attribute or property, the `active` property is turned on if the browser's location _doesn't_ match any of the registered elements' path

When the browser's location matches the element's path (or, for fallback elements, when none of the elements match the the browser's location), the element's `routerCallback(params, e)` function is called, where `params` is an object with matching URL parameters and `e` is the click event that generated the change of location.

routify.js allows routing groups; each group will have up to one possible active element, and one different fallback; this allows applications to have several levels of routing; for example, one main application group with pages with routes `/one`, `/two`, `/three` and another group with `/one/a`, `/one/b`, and `/one/c`. The default routing group is called `default`. In order to assign an element to a default group, the attribute `routing-group` or the property `routingGroup` can be set.

_The path template_

The path template has two special characters: `*` and `:`. They will both match not-empty strings. The main difference is that when `routerCallback()` is called, for each `:entry`  the `params` object will have a corresponding `entry`.  For example if the location is `/record/10` and the template is
`/record/:id`, this `routerCallback(params)` function will be called with `params` equal to `{ id: 10 }`


**unregisterRoute (el)**

It unregisters the element from the routing. This should be used before an element is deleted.

**registerRoutesFromSelector (root, selector)**

It registers all entries found in the children of element `root` as long as they match the `selector`. The `querySelectorAll` method of the `root` element is used to execute the query.

**unregisterRoutesFromSelector (root, selector)**

It registers all entries found in the children of element `root` as long as they match the `selector`.

**setConfig (key, value)**

It sets the keys (attribute keys or property keys) used to function. For example, `setConfig('activeAttribute', 'selected')` will make sure that each active element (that is, an element that satisfies the routing) will have the `selected` attribute set.

It's important to set alternate defaults _before_ registering elements.

Here are the defaults:

  * activeAttribute: 'active',
  * activeProperty: 'active',
  * pagePathAttribute: 'page-path',
  * pagePathProperty: 'pagePath',
  * routingGroupAttribute: 'routing-group',
  * routingGroupProperty: 'routingGroup',
  * fallbackAttribute: 'fallback',
  * fallbackProperty: 'fallback',
  * disableActivationAttribute: 'disable-activation',
  * disableActivationProperty: 'disableActivation',
  * routerCallbackProperty: 'routerCallback'


**getPagePathFromEl (el)**

Returns the path associated to the element, sourcing it from the attribute `page-path` (configurable by setting the config key `pagePathAttribute`), or the property `pagePath` of the element or the element's constructor (configurable with config key `pagePathProperty`).

When it's set as the property, it can be a single path or an array. If it's taken from the attribute, and there are several paths separated by spaces, it will return an array of the space-separated paths.

This means that if an element is defined as:

    <page-user page-path="/user /user/:id"></page-user>

`getPagePathFromEl (el)` will return an array containing `['/user', 'user/:id']`.

**getRoutingGroupFromEl (el)**

Returns the routing group associated to the element, sourcing it from the attribute `routing-group` (configurable by setting the config key `routingGroupAttribute`), or the property `routingGroup` of the element or the element's constructor (configurable with config key `routingGroupProperty`).

If it's not set, it returns `default` which is the elements' default group.

**getFallbackFromEl (el)**  

Returns `true` or `false`, sourcing the result from the presence of the attribute `fallback` (configurable by setting the config key `fallbackAttribute`), or the property `fallback` of the element or the element's constructor (configurable with config key `fallbackProperty`).

Only one element must be set as `fallback` in any given group.

**getDisableActivationFromEl (el)**  

Returns `true` or `false`, sourcing the result from the presence of the attribute `disable-activation` (configurable by setting the config key `disableActivationAttribute`), or the property `disableActivation` of the element or the element's constructor (configurable with config key `disableActivationProperty`).

**getActiveFromEl (el)**

Returns `true` or `false`, sourcing the result from the presence of the attribute `active` (configurable by setting the config key `activeAttribute`), or the property `active` of the element or the element's constructor (configurable with config key `activeProperty`).

Only one element can be active in any given group.

**emitPopstate (state)**

When changing the location with replaceState or pushState, the routing system must be made aware of the change. The easiest way to do so is to run the `emitPopstate()` method which will emit a `popState`, which will in turn trigger the routing callbacks.

**locationMatch (templateUrl, checker)**

This is a simple function that will check if a template URL matches with `window.location`.
It's very basic, and it might eventually be replaced with something more complex (although client-side routing doesn't tend to need complex routing paths)

The allowed syntax is:

* `/something`
* `/something/:page`
* `/something/whatever/:page`
* `/something/*`
* `/something/:page/*`

Both `*` and `:` character will match anything (as long as it's not empty). The main difference is what the function returns: for `:` routes,
if there is a match, `locationMatch` will return an object where every key is the matching `:key`.

For example if the location is `/record/10` and the template is `/record/:id`, this function will return `{ id: 10 }`
