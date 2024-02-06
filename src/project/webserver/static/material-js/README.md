This folder is used for JS files related to Material Web.

index.js simply imports the package, while bundle.js is generated with the following command, run from the `static/material-js` folder.
```bash
npx rollup -p @rollup/plugin-node-resolve index.js -o bundle.js
```
As such, bundle.js should not be edited manually.
