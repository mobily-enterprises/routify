import { html, css, LitElement } from 'lit-element';
import { RoutingPageMixin } from 'routify/lit/RoutingPageMixin.js'

export class PageMain extends RoutingPageMixin(LitElement) {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        text-align: center;
      }

      svg {
        animation: app-logo-spin infinite 20s linear;
      }

      @keyframes app-logo-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
  }

  static get properties() {
    return {
      title: { type: String },
      logo: { type: Function },
    };
  }

  static get pagePath () { return ['/', '/main'] }

  constructor() {
    super();
    this.title = 'Hello open-wc world!';
    this.logo = html``;
  }

  render() {
    return html`
      ${this.logo}
      <h1>${this.title}</h1>
      <p>Edit <code>src/MyApp.js</code> and save to reload.</p>
      <a
        class="app-link"
        href="https://open-wc.org/developing/#examples"
        target="_blank"
        rel="noopener noreferrer"
      >
        Code examples
      </a>
    `;
  }
}
