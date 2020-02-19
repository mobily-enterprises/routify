# Loading individual elements

The files in `distr` contain the bundled version of the full TPE library, minified and converted to ES5, in order to make sure that it's fully compatible with any browser.

Although distributing individual elements as a bundled, minified ES5 files is technically possible, each file would need to be loaded using AMD -- which would be cumbersome at best.

Alternatively, it's theoretically possible to load the elements using ES6, like so:

````
<script src="https://unpkg.com/@webcomponents/webcomponentsjs/webcomponents-bundle.js"></script>
<script type="module" src="./node_modules/tpe/themes/material/material.js"></script>
<script type="module" src="./node_modules/tpe/tpe.js"></script>
````

However, since TPE depends on `lit-element`, it will import it with the statement `import 'lit-element'` which will fail since 1) Import demands a relative path 2) There isn't a web standard (yet?) to "resolve" the paths of root modules. Even if `lit-element` were to be copied into the TPE tree, and changed every import of lit-element to a relative path, there is still a problem in terms of browser adoption of ES6.

Using the bundled, minified and ES5 version of TPE is the preferred way of using it in web sites. Complex web applications most likely have an established build pipeline which can easily include TPE.

When (if?) module name resolution becomes a standard and ES6 features will be widespread, TPE's individual elements will be usable directly.
