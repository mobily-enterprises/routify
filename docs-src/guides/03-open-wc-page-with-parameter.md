# A page with a parameter in an open-wc project

This guide build from a previous one, [Standard open-wc project to a routing-aware app in 6 steps](02-open-wc-to-routify.html). To start this guide, make sure that you have a working version of the routing-app from the previous guide.

The aim is to create a page with a parameter. This is a very common pattern in applications.

To do this, the component `page-one` will be modified.

## Changes to page-one

First of all, the URL page-one responds to must change to `/page-one/:id`:

    static get pagePath () { return '/page-one/:id' }

The `id` should be added as a property for the page:

    static get properties() {
      return {
        title: { type: String },
        counter: { type: Number },
        id: { type: Number } // NEW property added
      };
    }

Finally, a `routerCallback()` is also defined. This function will change the `id` property defined above with the routing's `id` parameter.

    routerCallback (params) {
      this.id = params.id
    }

Finally, it's useful to add some visual feedback to the page so that you can see that the `id` property is set. This is easily done by adding this code to `render()`:

    <span>URL parameter: ${this.id}</span>

That's it: the `page-one` page now needs a parameter, and it's able to use it.

## Changes to routing-app

In order to test page-one out, a few changes to the main app are necessary.

First of all, change the link to `page-one` into:

    <li>
      <a href="/page-one/30" ?selected="${this.page === 'page-one'}">
        Page One
      </a>
    </li>

Also, change the contents of the `page-about` element so that it has two links:

    <page-about class="page" page-path="/page-about">
      Link to id 40: <a href="page-one/40">page-one/40</a>
      Link to page-one without id: <a href="page-one">page-one</a>
      ${templateAbout}
    </page-about>

Since routing-app now has more than simple 1-level routing, `pagePath` should also be changed to:

````
    static get pagePath () { return ['/:page', '/:page/*'] }
````

This will make sure that `/page-one/40` and `/page-one/30` (or any ID for that matter) will match; this will enable `routerCallback()` to be triggered, and `this.id` to be changed. Remember that this is just for the highlighting of the active link: the actual routing happens within each page.

## Conclusion

Each page is always responsible of its own routing. This delegates routing complexity to each element. Adding a parameter to a route is very simple.

In a real-life example, when an element updates (via the `update()` callback), you would check whether the ID of the record displayed is the same as the element's `id` property. If different, a database load might be triggered.
