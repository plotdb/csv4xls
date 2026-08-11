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
  delimiter: ({csv: ',', tsv: \\t}[opt.format] or opt.delimiter or \\t)
  # xlsx output defaults to all-text so values like "00123" survive.
  force-text: if opt.force-text? => !!opt.force-text else true
  # builtin (0 dependency) writer unless sheetjs is explicitly asked for.
  engine: if opt.engine == \sheetjs => \sheetjs else \builtin

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
  # xlsx bytes. uses the builtin 0-dependency writer unless
  # `engine: 'sheetjs'` is given, in which case the global XLSX is required.
  to-xlsx: (data, options = {}) ->
    {force-text, engine} = parse-option options
    if engine != \sheetjs => return xlsx data, {force-text, sheet-name: options.sheet-name}
    if !has-xlsx! => throw new Error("XLSX module not found. Please include xlsx.js in your project.")
    workbook = obj.to-workbook data, {force-text}
    new Uint8Array(XLSX.write(workbook, {type: 'array', bookType: 'xlsx'}))
  # sheetjs workbook object, for callers that want to post-process it.
  to-workbook: (data, options = {}) ->
    if !has-xlsx! => throw new Error("XLSX module not found. Please include xlsx.js in your project.")
    workbook = XLSX.utils.book_new!
    
    # Create worksheet with standard method
    worksheet = XLSX.utils.aoa_to_sheet(data)
    
    # If force-text option is enabled, set all cells to text type
    if options.force-text
      for addr of worksheet
        # Skip non-cell properties like !ref
        if addr.0 != \!
          # Set cell type to string if it exists
          if worksheet[addr]?
            worksheet[addr].t = \s
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    return workbook
  to-blob: (data, options = {delimiter: undefined, format: 'auto', force-text: true}) ->
    {format, delimiter, force-text, engine} = parse-option options
    # xlsx is always available now thanks to the builtin writer.
    if format == 'xlsx' or format == 'auto'
      try
        buffer = obj.to-xlsx(data, options)
        return new Blob([buffer], {type: xlsx.mimetype})
      catch e
        # we should always throw exception in case that xlsx has issues.
        # otherwise extension and format will mismatch for caller.
        console.error "Failed to create XLSX: ", e
        throw e
    
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
  to-href: (data, options = {delimiter: undefined, format: 'auto', force-text: true}) ->
    blob = obj.to-blob(data, options)
    return URL.createObjectURL blob
  download: (data, name = "data", options = {delimiter: undefined, format: 'auto', force-text: true}) ->
    {format, delimiter, force-text} = parse-option options
    # Determine extension based on format and delimiter
    extension =
      if format == 'xlsx' or format == 'auto' => \.xlsx
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

csv4xls = (data, options = {delimiter: undefined, format: 'auto', force-text: true}) -> obj.to-href data, options
csv4xls <<< obj
# raw builtin writer, for callers that only want the bytes without any option handling.
csv4xls.xlsx = xlsx

if module? => module.exports = csv4xls
else if window? => window.csv4xls = csv4xls
