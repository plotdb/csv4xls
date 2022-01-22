# Change Logs

## v0.2.0

 - further minimize generated js file with mangling and compression
 - rename `csv4xls.js`, `csv4xls.min.js` to `index.js` and `index.min.js`
 - use `csv4xls` name in source
 - make module export simpler.
 - update `main` and `browser` field in `package.json`.
 - upgrade modules
 - patch test code to make it work with upgraded modules
 - release with compact directory structure


## v0.1.0

 - add `download` api for trigger csv download directly.


## v0.0.2

 - quote double quote properly by converting single double quote to double double quote.
 - quote all values when preparing csv strings from array to prevent from unexpected line-break or delimiter char.
 - use CR (carriage Return, \\r) to all replace LF (line feed, \\n) since excel seems prefer \\r over \\n.

