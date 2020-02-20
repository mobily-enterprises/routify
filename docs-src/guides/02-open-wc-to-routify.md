# Standard open-wc project to a routing-aware app in 6 steps

routify.js was thought with [open-wc](https://open-wc.org/) in mind.

Open-wc is a fantastic project; however, it's very agnostic in terms of routing, and it's basic project doesn't provide proper routing.
This guide will fix that.

First of all, create a new open-wc project:

    $ npm init @open-wc

And pick "Scaffold a new project" > "Application". Don't pick any of the extra options (Linting, Testing, Demoing, Building) and call it `routing-app`. Finish it off by creating the directory structure, and installing the npm components.
You can do the same thing by running:

    n$ pm init @open-wc --destinationPath /home/merc/Development/test/routing-app --type scaffold --scaffoldType app --features  --tagName routing-app --writeToDisk true --installDependencies npm      

Start the app with the usual `npm start`.

Now, let's get to work.

## Step 1: Install routify.js

First of all, install routify.js from npm:

    $ npm install --save routify

## Step 2: Routify your main component

You are ready to make the real changes.

Open the file `components/routing-app/src/RoutingApp.js`.  This is the entry point of your application, and it needs to become aware of routing.
To do that, add this to the top:

    import { MainPageMixin } from 'routify/lit/MainPageMixin.js'

And change the class declaration into:

    export class RoutingApp extends MainPageMixin(LitElement) {

This change alone will ensure that clicking on links from now on will not trigger a page reload.

Add this to the CSS:

       .page:not([active]) {
         display: none;
       }

       .page[active] {
         display: block;
       }

This CSS code will ensure that only active pages are actually displayed.

It's now time to change the links at the top. Rather than linking to hash anchors, they will link to proper URLs:

    <a href="/main">
      Main
    </a>
    </li>
    <li>
    <a href="/page-one">
      Page One
    </a>
    </li>
    <li>
    <a href="/page-about">
      About
    </a>

    <li>
    <a href="/wrong-link">
      Wrong link
    </a>
    </li>


Please note that there is also an extra "wrong link" in the mix. This will be used later to test the fallback.

You can now delete the functions `__navClicked()` and `__navClass()` which are no longer used.

The default version of the file will call `_renderPage()` which will render a different section of the file depending on `this.page` -- which was set by the now deleted `__navClicked()` function. It's now time to delete `${this._renderPage()}` and have this in its place:

         <page-main class="page" .logo=${openWcLogo}></page-main>
         <page-one class="page"></page-one>
         <page-about class="page" page-path="/page-about">${templateAbout}</page-about>
         <page-fallback class="page" fallback><p>Page not found try going to <a href="/main">Main</a></p></page-fallback>

Also, delete the `_renderPage()` function which is now useless.

Note that:

* `page-about` is a normal HTML element, not a lit-element one. So, its path is defined in the `page-path` attribute. `page-main` and `page-one` will define their paths in the component class.

* The `page-fallback` element is also a normal HTML element, and has the `fallback` attribute set it in.

You will see that RouterApp is still running in the browser. However, none of the pages are displaying since all of them are assigned the class `page` and becase of the added CSS rule pages of `page` class will only display if they have the `active` attribute -- and none of them do.

It's time to change that.

## Step 3: Routify the lit-element pages

This is the easiest step. It involves small changes to the lit-element pages.

### Change PageMain

Open the file `components/page-main/src/PageMain.js`. Some small changes will make this page routing-aware -- that is, it will add the `active` attribute to itself if the browser's location matches its path.

Add this to the top:

    import { MainPageMixin } from 'routify/lit/RoutingPageMixin.js'

And change the class declaration into:

    export class PageMain extends RoutingPageMixin(LitElement) {

Finally, make the element aware of its paths by adding this line:

    static get pagePath () { return ['/', '/main'] }

That's it: loading the app in the browser now, you will see that this element will display when the location is either `/` or `/main`. Again, there is no magic: all the element does is set (and unset) its `active` attribute depending on the browser's location.

### Change PageOne

Changes to PageOne are nearly identical Open the file `components/page-main/src/PageOne.js`.

Add this to the top:

    import { MainPageMixin } from 'routify/lit/RoutingPageMixin.js'

And change the class declaration into:

    export class PageOne extends RoutingPageMixin(LitElement) {

Finally, make the element aware of its paths by adding this line:

    static get pagePath () { return 'page-one' }

That's it.

### It works!

Loading the app in the browser now, you will see that both the main page and "Page one" will work fine.

## Step 4: Routify the last remaining (plain) elements

The About page is still not functional. Also, when clicking on the "Wrong link" at the top, nothing shows. The reason is obvious: the `active` attribute is off, and there is nothing to turn them on.

Routify needs to be made aware of these two pages manually. There are two ways to do that, and they both involve changing `components/routing-app/src/RoutingApp.js` (the app's main page).

1) Set a `routifySelector` in the main page.

Just add this to your main page:

    static get routifySelector () { return '.page' }

This will make sure that every element satisfying the selector `.page` will become active if their route matches.

2) Alternatively, you can set the elements by hand by adding this to your `firstUpdated()` hook of the main page:

    import { registerRoute } from 'routify/routify.js'

    firstUpdated () {
      super.firstUpdated()
      registerRoute(this.shadowRoot.querySelector('page-about'))
      registerRoute(this.shadowRoot.querySelector('page-fallback'))
    }

They are equivalent.

Once this is done, you will see that _all_ of the pages finally work. Even better, when clicking on the wrong link, the fallback page (marked so with the `fallback` attribute) is marked as active and therefore shown.

## Step 5: Make the links aware of the current page

One final touch is making sure that the current page stays selected in the navigation menu at the top.

For this to work, the main page `components/routing-app/src/RoutingApp.js` must be changed so that two things happen:

1) Links need to be set as `selected` by adding a `selected` attribute (conditionally added depending on the `page` property).

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

To do that, .
Also, change the CSS selector that comes by default for the links, so that it's simpler. From:

       header ul li a.active {

To:

       header ul li a[selected] {

2) Set the `page` property needs to be set.

This is where routify.js shines: in order to set the `page` property, all is needed is defining a route for the main page itself (just `/:page`) and a `routerCallback()` function which will be called when the route changes:


    routerCallback (params) {
      if (params.page === '') params.page = 'main'
      if (this.page !== params.page) {
        this.page = params.page
      }
    }

    static get pagePath () { return '/:page' }

Just like any other page, the `routerCallback()` will be called with the matching parameters -- in this case, `params.page` will be set because the `pageUrl` property has `:page`. At that point, the `page` property of this element is set -- which will in turn influence the `selected` attribute of the links.

## Step 6: Party!

Your application is now fully routing-aware. The full source code of the files that were changed is here:

* [RoutingApp.js](02-open-wc-to-routify/RoutingApp.js)
* [PageMain.js](02-open-wc-to-routify/PageMain.js)
* [PageOne.js](02-open-wc-to-routify/PageOne.js)

You can replace the default open-wc files as long as you have created the project with the same parameters used in this guide.
Don't forget to run `npm install --save routify` and it should all work.
