# according to https://stackoverflow.com/questions/155097
# convert utf-8 csv to utf-16le with BOM (0xff 0xfe )
# even with this, quoted newline only works
# if csv is opened by double clicking instead of text import wizard.
# Check if XLSX module exists
has-xlsx = ->
  try return typeof(XLSX) != 'undefined'
  catch => return false

parse-option = (opt = {}) ->
  format: opt.format or 'auto'
  delimiter: opt.delimiter or ({csv: ',', tsv: \t}[opt.format] or \t)

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
  to-blob: (data, options = {delimiter: undefined, format: 'auto'}) ->
    {format, delimiter} = parse-option options
    # If format is xlsx, use XLSX module
    if format == 'xlsx' or (format == 'auto' and has-xlsx!)
      try
        workbook = obj.to-xlsx(data)
        buffer = XLSX.write(workbook, {type: 'array', bookType: 'xlsx'})
        return new Blob([buffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})
      catch e
        console.warn "Failed to create XLSX. Falling back to CSV/TSV format.", e
        # Fall back to CSV/TSV if XLSX fails
    
    # If format is html, generate HTML table
    if format == 'html'
      html = obj.to-html(data, options.html or {})
      return new Blob([html], {type: "text/html"})
    
    # If format is xls-html, generate HTML table with BOM for Excel
    if format == 'xls-html'
      html = obj.to-html(data, options.html or {})
      
      # Create array with BOM (0xFF 0xFE for UTF-16LE) and convert HTML to UTF-16LE
      ba = new Uint8Array(2 + html.length * 2)
      ba[0] = 0xff
      ba[1] = 0xfe
      
      # Convert HTML string to UTF-16LE bytes
      for i from 0 til html.length
        ba[i * 2 + 2] = html.charCodeAt i
        ba[i * 2 + 3] = html.charCodeAt(i) .>>. 8
      
      return new Blob([ba], {type: "application/vnd.ms-excel"})
    
    # Use CSV/TSV format (default fallback)
    ba = obj.to-array(data, delimiter)
    mime-type = if delimiter == ',' then "text/csv" else "text/tab-separated-values"
    new Blob([ba], {type: mime-type})
  to-href: (data, options = {delimiter: undefined, format: 'auto'}) ->
    blob = obj.to-blob(data, options)
    return URL.createObjectURL blob
  download: (data, name = "data", options = {delimiter: undefined, format: 'auto'}) ->
    {format, delimiter} = parse-option options
    # Determine extension based on format and delimiter
    extension =
      if format == 'xlsx' or (format == 'auto' and has-xlsx!) => \.xlsx
      else if format == 'html' => \.html
      else if format == 'xls-html' => '.xls'
      else if delimiter == ',' => '.csv' else '.tsv'
    
    href = @to-href data, options
    a = document.createElement \a
    a.setAttribute \href, href
    a.setAttribute \download, name + (if new RegExp("\\#{extension}$", 'i').exec(name) => '' else extension)
    a.style.opacity = 0
    a.style.position = \absolute
    document.body.appendChild a
    a.click!
    document.body.removeChild a
  to-html: (data, options = {}) ->
    # Default options
    opts = {
      table-class: options.table-class or 'csv4xls-table'
      cell-style: options.cell-style or true
      header-row: options.header-row or false
    }
    
    # Start building HTML
    html = "<table class=\"#{opts.table-class}\">"
    
    # Process each row
    for row, i in data
      # Determine if this is a header row
      is-header = opts.header-row and i == 0
      tag = if is-header then 'th' else 'td'
      
      html += "<tr>"
      for cell in row
        # Apply mso-number-format style to prevent Excel from changing formats
        style = if opts.cell-style then ' style="mso-number-format:\'\\@\';"' else ''
        
        # Escape HTML special characters
        safe-cell = ('' + cell)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;')
        
        html += "<#{tag}#{style}>#{safe-cell}</#{tag}>"
      html += "</tr>"
    
    html += "</table>"
    return html

csv4xls = (data, options = {delimiter: undefined, format: 'auto'}) -> obj.to-href data, options
csv4xls <<< obj

if module? => module.exports = csv4xls
else if window? => window.csv4xls = csv4xls
