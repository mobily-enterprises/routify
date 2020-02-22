import { registerRoute, unregisterRoute, registerRoutesFromSelector, unregisterRoutesFromSelector } from '../routify'

export const MainPageMixin = (base) => {
  return class Base extends base {
    static get disableActivation () { return true }

    connectedCallback () {
      super.connectedCallback()
      registerRoute(this)
    }

    disconnectedCallback () {
      super.connectedCallback()
      unregisterRoute(this)
      unregisterRoutesFromSelector(this.shadowRoot, this.constructor.routifySelector)
    }

    async firstUpdated () {
      super.firstUpdated()

      if (this.constructor.routifySelector) {
        registerRoutesFromSelector(this.shadowRoot, this.constructor.routifySelector)
      }
    }
  }
}
