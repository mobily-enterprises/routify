import { locationMatch, getPagePathFromEl, registerRoute, registerRoutesFromSelector } from '../routify'

export const MainPageMixin = (base) => {
  return class Base extends base {
    static get disableActivation () { return true }

    firstUpdated () {
      super.firstUpdated()
      registerRoute(this)

      if (this.constructor.routifySelector) {
        registerRoutesFromSelector(this.shadowRoot, this.constructor.routifySelector)
      }
    }

    locationMatch (checker) {
      return locationMatch(getPagePathFromEl(this), checker)
    }

    async preRouterCallback (p) {
      await this.updateComplete
    }
  }
}
