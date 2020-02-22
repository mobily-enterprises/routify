import { locationMatch, getPagePathFromEl, registerRoute, unregisterRoute, registerRoutesFromSelector, unregisterRoutesFromSelector } from '../routify'

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
      unregisterRoutesFromSelector(this.shadowRoot, this.constructor.routifySelector)
    }

    firstUpdated () {
      super.firstUpdated()

      if (this.constructor.routifySelector) {
        registerRoutesFromSelector(this.shadowRoot, this.constructor.routifySelector)
      }
    }

    locationMatch (checker) {
      return locationMatch(getPagePathFromEl(this), checker)
    }
  }
}
