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

The path template has two special characters: `*` and `:`. They will both match not-empty strings. The main difference is that when `routerCallback()` is called, for `:` routes the `params` object will have a corresponding `:key`.  For example if the location is `/record/10` and the template is
`/record/:id`, this `routerCallback()` function will be called with parameters `{ id: 10 }`


**unregisterRoute (el)**

It unregisters the element from the routing. This should be used before an element is deleted.

**registerRoutesFromSelector (root, selector)**

**unregisterRoutesFromSelector (root, selector)**



**setConfig (key, value)**
  * activeAttribute: 'active',
  * activeProperty: 'active',
  * pathAttribute: 'page-path',
  * pathProperty: 'pagePath',
  * routingGroupAttribute: 'routing-group',
  * routingGroupProperty: 'routingGroup',
  * fallbackAttribute: 'fallback',
  * fallbackProperty: 'fallback',
  * disableActivationAttribute: 'disable-activation',
  * disableActivationProperty: 'disableActivation',
  * routerCallbackProperty: 'routerCallback'

**pagePathFromEl (el)**

**getFallbackFromEl (el)**  

**getDisableActivationFromEl (el)**  

**getActiveFromEl (el)**


**emitPopstate (state)**

**locationMatch (templateUrl, checker)**
