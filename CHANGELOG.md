# Change Logs

## v0.4.0

 - **BREAKING CHANGE**: Add option to choose between comma and tab as delimiter
   - Default delimiter changed to tab (`'\t'`), which creates TSV files
   - File extension now depends on delimiter: `.csv` for comma, `.tsv` for tab
   - MIME type now depends on delimiter: `text/csv` for comma, `text/tab-separated-values` for tab
   - All API methods now accept a `delimiter` parameter
   - `download` API now accepts an `options` object with `delimiter` property
   - Default filename extension changed from `.csv` to `.tsv` when using default delimiter
 - Add support for XLSX format output
   - New `toXlsx` method to convert data to XLSX workbook
   - Add `format` option to `toBlob`, `toHref`, and `download` methods
   - Auto-detect XLSX availability with fallback to CSV/TSV
   - Set appropriate MIME type and file extension based on format
   - Add dependency on SheetJS library (xlsx.js)


## v0.3.0

 - add `toString` api


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

