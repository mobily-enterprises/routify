import { locationMatch, getPagePathFromEl, registerRoute, unregisterRoute, registerRoutesFromSelector } from '../routify'

export const MainPageMixin = (base) => {
  return class Base extends base {
    static get disableActivation () { return true }

    connectedCallback () {
      super.connectedCallback()
      registerRoute(this)
    }

    disconnectedCallback () {
      super.disconnectedCallback()
      unregisterRoute(this)
    }

    firstUpdated () {
      super.firstUpdated()

      if (this.constructor.routifySelector) {
        registerRoutesFromSelector(this.shadowRoot, this.constructor.routifySelector)
      }
    }

    async preRouterCallback (params) {
      await this.updateComplete
    }

    locationMatch (checker) {
      return locationMatch(getPagePathFromEl(this), checker)
    }
  }
}
