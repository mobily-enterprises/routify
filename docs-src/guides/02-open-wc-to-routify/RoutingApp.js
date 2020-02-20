import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { openWcLogo } from './open-wc-logo.js';

import '../../page-main/page-main.js';
import '../../page-one/page-one.js';
import { templateAbout } from './templateAbout.js';

import { MainPageMixin } from 'routify/lit/MainPageMixin.js'
import { registerRoute } from 'routify/routify.js'

export class RoutingApp extends MainPageMixin(LitElement) {
  static get properties() {
    return {
      title: { type: String },
      page: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
      }

      header {
        width: 100%;
        background: #fff;
        border-bottom: 1px solid #ccc;
      }

      header ul {
        display: flex;
        justify-content: space-around;
        min-width: 400px;
        margin: 0 auto;
        padding: 0;
      }

      header ul li {
        display: flex;
      }

      header ul li a {
        color: #5a5c5e;
        text-decoration: none;
        font-size: 18px;
        line-height: 36px;
      }

      header ul li a:hover,
      header ul li a[selected] {
        color: blue;
      }

      main {
        flex-grow: 1;
      }

      .app-footer {
        font-size: calc(12px + 0.5vmin);
        align-items: center;
      }

      .app-footer a {
        margin-left: 5px;
      }

      .page:not([active]) {
        display: none;
      }

      .page[active] {
        display: block;
      }

    `;
  }

  constructor() {
    super();
    this.page = 'main';
  }

  routerCallback (params) {
    if (params.page === '') params.page = 'main'
    if (this.page !== params.page) {
      this.page = params.page
    }
  }

  static get pagePath () { return '/:page' }

  // Solution 1 to activate non-lit elements
  static get routifySelector () { return '.page' }

  /*
  // Solution 2 to activate non-lit elements
  firstUpdated () {
    super.firstUpdated()

    registerRoute(this.shadowRoot.querySelector('page-about'))
    registerRoute(this.shadowRoot.querySelector('page-fallback'))
  }
  */

  render() {
    return html`
      ${this.page}
      <header>
        <ul>
          <li>
            <a href="/" ?selected="${this.page === 'main'}">
              Main
            </a>
          </li>
          <li>
            <a href="/page-one" ?selected="${this.page === 'page-one'}">
              Page One
            </a>
          </li>
          <li>
            <a href="/page-about" ?selected="${this.page === 'page-about'}">
              About
            </a>
          </li>
          <li>
            <a href="/wrong-link">
              Wrong
            </a>
          </li>
        </ul>
      </header>

      <main>
          <page-main class="page" .logo=${openWcLogo}></page-main>
          <page-one class="page"></page-one>
          <page-about class="page" page-path="/page-about">${templateAbout}</page-about>
          <page-fallback class="page" fallback><p>Page not found try going to <a href="/main">Main</a></p></page-fallback>
      </main>

      <p class="app-footer">
        🚽 Made with love by
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/open-wc">open-wc</a>.
      </p>
    `;
  }
}
