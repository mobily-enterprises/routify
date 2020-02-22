# routify.js API

API is not yet documented. Have a look at the [guides](guides.html) for now

**registerRoute (el)**

The element `el` is registered as a valid route.
The 

**registerRoutesFromSelector (root, selector)**




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
