import { locationMatch, getPagePathFromEl, registerRoute, registerRoutesFromSelector } from '../routify'

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

    locationMatch (checker) {
      return locationMatch(getPagePathFromEl(this), checker)
    }

    async routerCallbackWithUpdate (params) {
      if (this.routerCallback) {
        await this.updateComplete
        this.routerCallback(params)
      }
    }
  }
}
