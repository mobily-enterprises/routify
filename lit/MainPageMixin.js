import { registerRoute, registerRoutesFromSelector } from '../routify'

export const MainPageMixin = (base) => {
  return class Base extends base {
    static get properties () {
      return {
        page: { type: String }
      }
    }

    static get pagePath () { return '/:page' }
    static get disableActivation () { return true }
    // static get routifySelector () { return '.page' }

    constructor () {
      super()

      registerRoute(this)
    }

    firstUpdated () {
      super.firstUpdated()

      if (this.constructor.routifySelector) {
        registerRoutesFromSelector(this.shadowRoot, this.constructor.routifySelector)
      }
    }
  }
}
