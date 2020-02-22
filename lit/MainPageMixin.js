import { registerRoute, registerRoutesFromSelector } from '../routify'

export const MainPageMixin = (base) => {
  return class Base extends base {
    static get disableActivation () { return true }

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
