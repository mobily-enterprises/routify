import { registerRoute, registerRouteFromSelector } from '../routify'

export const MainPageMixin = (base) => {
  return class Base extends base {
    static get properties () {
      return {
        page: { type: String }
      }
    }

    static get pagePath () { return '/:page' }
    static get disableActivation () { return true }
    static get routifySelector () { return '.page' }

    constructor () {
      super()

      registerRoute(this)
    }

    firstUpdated () {
      super.firstUpdated()

      if (this.constructor.routifySelector) {
        registerRouteFromSelector(this.shadowRoot, this.constructor.routifySelector)
      }
    }
  }
}
