# Sub routes (or routing groups) with routify.js

This guide build from a previous one, [Standard open-wc project to a routing-aware app in 6 steps](02-open-wc-to-routify.html). To start this guide, make sure that you have a working version of the routing-app from the previous guide.

The aim is to create routing-aware sub-pages. This is a very common pattern in applications.

To do this, the component `routing-app` will be modified.

## Routing groups

routify.js supports routing groups. Up to this point, there was a list of pages (`page-main`, `page-one`, etc) and one fallback page which became active if none of the pages were active.

By default, pages belong to the `default` group. A fallback is activated if none of the pages in that group are active. Having different routing groups means that two different pages in two different groups may become active, and that each group gets a separate fallback page

## Changes to routing-app

To show how to create a different group, the `page-about` page will be turned into a multi-tab page; each tab has a different route, and the page has its own fallback.

Doing this is surprisingly simple: the only thing to do is add a link bar to the about page, and add different pages making sure that each one belongs to the same `routing-group`.

So, the about page -- which was originally this:

    <page-about class="page" page-path="/page-about">${templateAbout}</page-about>

Becomes:

````
    <page-about class="page" page-path="/page-about /page-about/:aboutSubpage">

      <header>
        <ul>

          <li>
            <a href="/page-about/one">
              About ->  One
            </a>
          </li>
          <li>
            <a href="/page-about/two">
              About -> Two
            </a>
          </li>
          <li>
            <a href="/page-about/wrong-link">
              About -> Wrong
            </a>
          </li>
        </ul>
      </header>

      <about-one class="page" page-path="/page-about /page-about/one" routing-group="about">
        <h1>About ONE</h1>
      </about-one>

      <about-two class="page" page-path="/page-about/two" routing-group="about">
        <h1>About TWO</h1>
      </about-two>

      <about-fallback class="page" fallback routing-group="about">
        <h1>About FALLBACK</h1>
      </about-fallback>


    </page-about>
````

The only other modification, is the `pagePath` property of `routing-app` that needs to become:

````
    static get pagePath () { return ['/:page', '/:page/*'] }
````

This is to make sure that when selecting one of sub-routes , the `about` link is shown as selected.

## Conclusion

In this guide, the about links are not marked as `selected`. This is because `page-about` is a simple HTML element with no implemented logic. If `page-about` were a component, it would be trivial to mix it in with `MainPageMixin` and implement the `routerCallback()` function to assign `this.aboutSubpage` to `params.aboutSubpage`, as it happens in `RoutingApp.js`
