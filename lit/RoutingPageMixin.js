import { registerRoute, locationMatch, getPagePathFromEl } from '../routify'

export const RoutingPageMixin = (base) => {
  return class Base extends base {
    static get properties () {
      return {
        active: { type: Boolean }
      }
    }

    constructor () {
      super()

      registerRoute(this)
    }

    // Only render this page if it's actually visible.
    shouldUpdate () {
      return this.active
    }

    locationMatch (checker) {
      return locationMatch(getPagePathFromEl(this), checker)
    }
  }
}
