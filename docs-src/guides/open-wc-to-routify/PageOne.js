import { html, css, LitElement } from 'lit-element';
import { RoutingPageMixin } from 'routify/lit/RoutingPageMixin.js'

export class PageOne extends RoutingPageMixin(LitElement) {
  static get styles() {
    return css`
      :host {
        --page-one-text-color: #000;

        display: block;
        padding: 25px;
        color: var(--page-one-text-color);
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      counter: { type: Number },
    };
  }

  static get pagePath () { return '/page-one' }

  constructor() {
    super();
    this.title = 'Hey there';
    this.counter = 5;
  }

  __increment() {
    this.counter += 1;
  }

  render() {
    return html`
      <h2>${this.title} Nr. ${this.counter}!</h2>
      <button @click=${this.__increment}>increment</button>
    `;
  }
}
