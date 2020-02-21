# Using routify.js on straight HTML pages

Using routify.js in straight HTML pages is probably not the most common use case.
However, it is a great way to see the potential of routify.js.

First of all, create a new directory:

    $ mkdir plain-page-app

Once in it, initialise it for NPM:

    $ npm init

Answer the basic questions. At this point, install the `es-dev-server` which will only be used to serve the same entry point:

    $ npm install --save es-dev-server

Finally, install routify.js:

    $ npm install --save routify


At this point you are ready to serve your `index.html` file with the command:

    $ ./node_modules/.bin/es-dev-server -a index.html

Create an index.html file with the following contents:

````
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="Description" content="Put your description here.">
  <base href="/">

  <style>
    html, body {
      margin: 0;
      padding: 0;
      font-family: sans-serif;
      background-color: #ededed;
    }

    #app {
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
  </style>
  <title>routing-app</title>
</head>
<body>
  <div id="app">
    <header>
      <ul>
        <li>
          <a href="/page-main">
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
        </li>
        <li>
          <a href="/wrong-link">
            Wrong
          </a>
        </li>
      </ul>
    </header>

    <main>
      <page-main class="page" page-path="/page-main /">
        <h1>Main page</h1>
      </page-main>

      <page-one class="page" page-path="/page-one">
        <h1>Page one</h1>
      </page-one>

      <page-about class="page" page-path="/page-about">
        <h1>About page</h1>
      </page-about>

      <page-fallback class="page" fallback>
        <p>Page not found try going to <a href="/">Main</a></p>
      </page-fallback>
    </main>

    <p class="app-footer">
      🚽 Made with love by
      <a target="_blank" rel="noopener noreferrer" href="https://github.com/open-wc">open-wc</a>.
    </p>
  </div>

  <script type="module">
    import { registerRoute, registerRoutesFromSelector } from './node_modules/routify/routify.js'
    registerRoutesFromSelector(document, '.page')

    document.querySelector('page-main').routerCallback = (params) => {
      console.log('Displaying main page')
    }
  </script>

</body>

</html>
````

As you can see, it's a basic HTML file. The only interesting part is the last bit:

    <script type="module">
      import { registerRoutesFromSelector } from './node_modules/routify/routify.js'
      registerRoutesFromSelector(document, '.page')

      document.querySelector('page-main').routerCallback = (params) => {
        console.log('Displaying main page')
      }
    </script>

This will make sure that routify.js is imported as a module, and that all of the pages with class `page` will have the `active` attribute when their paths are active.

Their paths are set by the `page-path` attribute. Note that the main page has two space-separated routes.

To show the potential of this solution, note that a function called `routerCallback()` is added to one of the routing elements; that function is called every time a route becomes active.
