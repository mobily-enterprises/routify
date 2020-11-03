import { registerRoute, unregisterRoute, locationMatch, getPagePathFromEl } from '../routify'

export const RoutingPageMixin = (base) => {
  return class Base extends base {
    static get properties () {
      return {
        active: { type: Boolean }
      }
    }

    connectedCallback () {
      super.connectedCallback()
      registerRoute(this)
    }

    disconnectedCallback () {
      super.disconnectedCallback()
      unregisterRoute(this)
    }

    locationMatch (checker) {
      return locationMatch(getPagePathFromEl(this), checker)
    }

    async preRouterCallback (params) {
      await this.updateComplete
    }

    // Only render this page if it's actually visible.
    shouldUpdate () {
      return this.active
    }
  }
}
