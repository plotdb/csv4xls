# csv4xls

Convert a 2D array to xls-compatible CSV file.


## Usage

include csv4xls script, and use:

    ret = csv4xls.toBlob([[1,2,3],[4,5,6]])


## API

csv4xls provides following APIs:

 - `toString(data)` - convert given 2D array to CSV in String format.
 - `toArray(data)` - convert given 2D array to an xls-compatible CSV file in thr returned Uint8Array.
 - `toBlob(data)` - same as `toArray` but return a corresponding blob.
 - `toHref(data)` - same as `toBlob` but return a corresponding object url.
 - `download(data, filename)` - trigger file download


## Limitation

Only work with Excel if file is opened directly. Doesn't work when importing with text import wizard.


## License

MIT
