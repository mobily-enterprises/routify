# routify.js API

API is not yet documented. Have a look at the [guides](guides.html) for now


**registerRoute (el)**

The element `el` is registered as a valid route. The element's route is set by the attribute `page-path` or property `pagePath`.
Once an element is registered, its `active` property _and_ attribute are set to true **if** the browser's location matches the element's path; there are two exceptions to this rule:

* if the element has the `disable-activation` attribute or the `disableActivation` property, the `active` property/attribute is untouched

* if the element has the `fallback` attribute or property, the `active` property is turned on if the browser's location _doesn't_ match the element's path

When the browser's location matches the element's path (or, for fallback elements, when the browser's location _doesn't match_ the element's path), the element's `routerCallback(params, e)` function is called, where `params` is an object with matching URL parameters and `e` is the click event that generated the change of location.

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

Returns the path associated to the element, sourcing it from the attribute `page-path` (configurable by setting the config key `pagePathAttribute`), or the property `pagePathProperty` of the element or the element's constructor (configurable with config key `pagePathProperty`).

When it's set as the property, it can be a single path or an array. If it's taken from the attribute, and there are several paths separated by spaces, it will return an array of the space-separated paths.

This means that if an element is defined as:

    <page-user page-path="/user /user/:id"></page-user>

`getPagePathFromEl (el)` will return an array containing `['/user', 'user/:id']`.

TODO: Give examples for property (single and array) and static getters

**getFallbackFromEl (el)**  

**getDisableActivationFromEl (el)**  

**getActiveFromEl (el)**

**getRoutingGroupFromEl (el)**




**emitPopstate (state)**

**locationMatch (templateUrl, checker)**
