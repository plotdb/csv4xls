# csv4xls

Convert a 2D array to xls-compatible CSV file.


## Usage

include csv4xls script, and use:

    ret = csv4xls.toBlob([[1,2,3],[4,5,6]])


## API

csv4xls provides following APIs:

 * toArray - convert given 2D array to an xls-compatible CSV file, stores in an Uint8Array and returns the array.
 * toBlob - same as `toArray` but return a corresponding blob.
 * toHref - same as `toBlob` but return a corresponding object url.


## Limitation

Only work with Excel if file is opened directly but double clicking. It won't work with text import wizard.


## License

MIT
