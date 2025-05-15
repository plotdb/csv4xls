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
    
    // Download with options
    csv4xls.download([[1,2,3],[4,5,6]], "mydata", {delimiter: ','}) // Will download as mydata.csv
    csv4xls.download([[1,2,3],[4,5,6]], "mydata") // Will download as mydata.tsv
    csv4xls.download([[1,2,3],[4,5,6]], "mydata", {format: 'xlsx'}) // Will download as mydata.xlsx


## API

csv4xls provides following APIs:

 - `toString(data, delimiter = '\t')` - convert given 2D array to CSV/TSV in String format.
 - `toArray(data, delimiter = '\t')` - convert given 2D array to an xls-compatible CSV/TSV file in the returned Uint8Array.
 - `toXlsx(data)` - convert given 2D array to XLSX workbook (requires XLSX library).
 - `toBlob(data, options = {delimiter: '\t', format: 'auto'})` - convert data to blob with specified format.
   - If `format` is `'xlsx'`, returns XLSX blob (requires XLSX library)
   - If `format` is `'auto'` (default), uses XLSX if available, otherwise falls back to CSV/TSV
   - If XLSX is not available or fails, falls back to CSV/TSV based on delimiter
 - `toHref(data, options = {delimiter: '\t', format: 'auto'})` - same as `toBlob` but return a corresponding object url.
 - `download(data, name = "data", options = {delimiter: '\t', format: 'auto'})` - trigger file download
   - If `format` is `'xlsx'`, file extension will be `.xlsx` (requires XLSX library)
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
