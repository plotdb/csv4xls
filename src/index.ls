# according to https://stackoverflow.com/questions/155097
# convert utf-8 csv to utf-16le with BOM (0xff 0xfe )
# even with this, quoted newline only works
# if csv is opened by double clicking instead of text import wizard.
# Check if XLSX module exists
has-xlsx = ->
  try
    return typeof(XLSX) != 'undefined'
  catch
    return false

obj = do
  to-string: (data, delimiter = '\t') ->
    str = data.map((d,i) -> d.map((v,j) -> "#v").join(delimiter)).join('\r\n')
    str = data
      .map (d,i) ->
        d
          .map (v,j) -> '"' + ('' + v).replace(/"/g, '""').replace(/\n/g,'\r') + '"'
          .join delimiter
      .join '\r\n'
  to-array: (data, delimiter = '\t') ->
    str = obj.to-string data, delimiter
    ba = new Uint8Array(2 + str.length * 2)
    for i from 0 til str.length
      ba[i * 2 + 2] = str.charCodeAt i
      ba[i * 2 + 3] = str.charCodeAt(i) .>>. 8
    ba[0] = 0xff
    ba[1] = 0xfe
    return ba
  to-xlsx: (data) ->
    if !has-xlsx! => throw new Error("XLSX module not found. Please include xlsx.js in your project.")
    workbook = XLSX.utils.book_new!
    worksheet = XLSX.utils.aoa_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    return workbook
  to-blob: (data, options = {delimiter: '\t', format: 'auto'}) ->
    delimiter = options.delimiter or '\t'
    format = options.format or 'auto'
    
    # If format is xlsx, use XLSX module
    if format == 'xlsx' or (format == 'auto' and has-xlsx!)
      try
        workbook = obj.to-xlsx(data)
        buffer = XLSX.write(workbook, {type: 'array', bookType: 'xlsx'})
        return new Blob([buffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})
      catch e
        console.warn "Failed to create XLSX. Falling back to CSV/TSV format.", e
        # Fall back to CSV/TSV if XLSX fails
    
    # Use CSV/TSV format
    ba = obj.to-array(data, delimiter)
    mime-type = if delimiter == ',' then "text/csv" else "text/tab-separated-values"
    new Blob([ba], {type: mime-type})
  to-href: (data, options = {delimiter: '\t', format: 'auto'}) ->
    blob = obj.to-blob(data, options)
    return URL.createObjectURL blob
  download: (data, name = "data", options = {delimiter: '\t', format: 'auto'}) ->
    delimiter = options.delimiter or '\t'
    format = options.format or 'auto'
    
    # Determine extension based on format and delimiter
    extension =
      if format == 'xlsx' or (format == 'auto' and has-xlsx!)
        try
          '.xlsx'
        catch
          if delimiter == ',' then '.csv' else '.tsv'
      else
        if delimiter == ',' then '.csv' else '.tsv'
    
    href = @to-href data, options
    a = document.createElement \a
    a.setAttribute \href, href
    a.setAttribute \download, name + (if new RegExp("\\#{extension}$", 'i').exec(name) => '' else extension)
    a.style.opacity = 0
    a.style.position = \absolute
    document.body.appendChild a
    a.click!
    document.body.removeChild a

csv4xls = (data, options = {delimiter: '\t', format: 'auto'}) -> obj.to-href data, options
csv4xls <<< obj

if module? => module.exports = csv4xls
else if window? => window.csv4xls = csv4xls
