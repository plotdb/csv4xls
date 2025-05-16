# csv4xls

Convert a 2D array to xls-compatible CSV, TSV, or XLSX file.


## Usage

include csv4xls script, and use:

    // Default: Tab-separated (TSV)
    ret = csv4xls.toBlob([[1,2,3],[4,5,6]])
    
    // Using comma as delimiter (CSV)
    ret = csv4xls.toBlob([[1,2,3],[4,5,6]], {delimiter: ','})
    
    // Using XLSX format (requires XLSX library)
    ret = csv4xls.toBlob([[1,2,3],[4,5,6]], {format: 'xlsx'})
    
    // Using XLSX format with all cells forced to text type
    ret = csv4xls.toBlob([[1,2,3],[4,5,6]], {format: 'xlsx', forceText: true})
    
    // Download with options
    csv4xls.download([[1,2,3],[4,5,6]], "mydata", {delimiter: ','}) // Will download as mydata.csv
    csv4xls.download([[1,2,3],[4,5,6]], "mydata") // Will download as mydata.tsv
    csv4xls.download([[1,2,3],[4,5,6]], "mydata", {format: 'xlsx'}) // Will download as mydata.xlsx
    csv4xls.download([[1,2,3],[4,5,6]], "mydata", {format: 'xlsx', forceText: true}) // Will download as mydata.xlsx with all cells as text


## API

csv4xls provides following APIs:

 - `toString(data, delimiter = '\t')` - convert given 2D array to CSV/TSV in String format.
 - `toArray(data, delimiter = '\t')` - convert given 2D array to an xls-compatible CSV/TSV file in the returned Uint8Array.
 - `toXlsx(data)` - convert given 2D array to XLSX workbook (requires XLSX library).
 - `toBlob(data, options = {delimiter: '\t', format: 'auto', forceText: false})` - convert data to blob with specified format.
   - If `format` is `'xlsx'`, returns XLSX blob (requires XLSX library)
   - If `format` is `'html'`, returns HTML table as blob with MIME type `text/html`
   - If `format` is `'xls-html'`, returns HTML table with BOM as blob with MIME type `application/vnd.ms-excel`
     - Uses `mso-number-format:'\@'` style to prevent Excel from changing formats
   - If `format` is `'auto'` (default), uses XLSX if available, otherwise falls back to CSV/TSV
   - If XLSX is not available or fails, falls back to CSV/TSV based on delimiter
   - HTML options can be passed via `options.html` object (see `toHtml` for available options)
   - If `forceText` is `true`, all cells in XLSX output will be set to text type (`t: "s"`) to prevent Excel from automatically converting data types
 - `toHref(data, options = {delimiter: '\t', format: 'auto', forceText: false})` - same as `toBlob` but return a corresponding object url.
 - `toHtml(data, options = {})` - convert given 2D array to HTML table format.
   - `options.tableClass` - CSS class for the table (default: 'csv4xls-table')
   - `options.cellStyle` - Whether to apply `mso-number-format:'\@'` style to cells to prevent Excel from changing formats (default: true)
   - `options.headerRow` - Whether to treat the first row as a header row using `<th>` tags (default: false)
 - `download(data, name = "data", options = {delimiter: '\t', format: 'auto', forceText: false})` - trigger file download
   - If `format` is `'xlsx'`, file extension will be `.xlsx` (requires XLSX library)
   - If `format` is `'html'`, file extension will be `.html`
   - If `format` is `'xls-html'`, file extension will be `.xls` (HTML with BOM that Excel can open)
   - If `format` is `'auto'` (default), uses XLSX if available, otherwise falls back to CSV/TSV
   - If using CSV/TSV: delimiter `','` → `.csv`, delimiter `'\t'` → `.tsv`


## Limitation

- CSV/TSV format only works with Excel if file is opened directly. Doesn't work when importing with text import wizard.
- Default delimiter is tab (`'\t'`), which creates TSV files.
- File extension and MIME type are automatically set based on the format and delimiter:
  - XLSX → `.xlsx` with MIME type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - Comma (`,`) → `.csv` with MIME type `text/csv`
  - Tab (`\t`) → `.tsv` with MIME type `text/tab-separated-values`
- XLSX format requires the [SheetJS](https://sheetjs.com/) library (xlsx.js) to be included in your project.
- When `format` is set to `'auto'` (default), the library will use XLSX if available, otherwise fall back to CSV/TSV.



## License

MIT
