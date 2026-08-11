# minimal, dependency-free xlsx writer.
#
# xlsx is just a zip of xml files, and zip entries don't have to be compressed,
# so we can build a real xlsx with only a STORE-mode zip writer + crc32,
# skipping DEFLATE and any third party library entirely.
#
# strings are written as inline strings ( no sharedStrings.xml ) to keep
# the generated package minimal. no styles are applied - by default every
# value is written as text so excel won't reinterpret things like "00123".

crc-table = do ->
  ret = new Uint32Array(256)
  for n from 0 til 256
    c = n
    for _ from 0 til 8
      c = if c .&. 1 => (0xEDB88320 .^. (c .>>>. 1)) .>>>. 0 else c .>>>. 1
    ret[n] = c .>>>. 0
  ret

crc32 = (bytes) ->
  c = 0xFFFFFFFF
  for i from 0 til bytes.length
    c = (crc-table[(c .^. bytes[i]) .&. 0xff] .^. (c .>>>. 8)) .>>>. 0
  (c .^. 0xFFFFFFFF) .>>>. 0

# TextEncoder covers all modern targets; fallback keeps old browsers working.
utf8 = (str) ->
  if typeof(TextEncoder) != \undefined => return new TextEncoder!.encode str
  bytes = []
  for i from 0 til str.length
    c = str.charCodeAt i
    if c < 0x80 => bytes.push c
    else if c < 0x800 => bytes.push (0xc0 .|. (c .>>. 6)), (0x80 .|. (c .&. 0x3f))
    else if c >= 0xd800 and c <= 0xdbff and i + 1 < str.length
      c2 = str.charCodeAt(i + 1)
      cp = 0x10000 + ((c .&. 0x3ff) .<<. 10) + (c2 .&. 0x3ff)
      i := i + 1
      bytes.push (0xf0 .|. (cp .>>. 18)), (0x80 .|. ((cp .>>. 12) .&. 0x3f)),
        (0x80 .|. ((cp .>>. 6) .&. 0x3f)), (0x80 .|. (cp .&. 0x3f))
    else bytes.push (0xe0 .|. (c .>>. 12)), (0x80 .|. ((c .>>. 6) .&. 0x3f)), (0x80 .|. (c .&. 0x3f))
  new Uint8Array(bytes)

# control chars other than tab/lf/cr are illegal in xml 1.0 and make excel
# refuse the file, so drop them rather than escaping.
esc = (v) ->
  ('' + v)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

col-name = (idx) ->
  ret = ''
  n = idx
  while true
    ret = String.fromCharCode(65 + (n % 26)) + ret
    n = Math.floor(n / 26) - 1
    break if n < 0
  ret

# sheet name rules: 1~31 chars, and []:*?/\ are not allowed.
sheet-name = (name) ->
  ret = ('' + (name or 'Sheet1')).replace(/[\[\]:*?\/\\]/g, ' ').substring(0, 31)
  if ret.trim! => ret else 'Sheet1'

cell = (v, ref, force-text) ->
  return '' if !v? or v == ''
  if !force-text
    if typeof(v) == \number
      return '' if !isFinite(v)
      return "<c r=\"#ref\"><v>#v</v></c>"
    if typeof(v) == \boolean => return "<c r=\"#ref\" t=\"b\"><v>#{if v => 1 else 0}</v></c>"
  s = if v instanceof Date => v.toISOString! else '' + v
  "<c r=\"#ref\" t=\"inlineStr\"><is><t xml:space=\"preserve\">#{esc s}</t></is></c>"

sheet-xml = (data, force-text) ->
  rows = for row, i in data
    cells = [cell(v, col-name(j) + (i + 1), force-text) for v, j in (row or [])]
    "<row r=\"#{i + 1}\">#{cells.join ''}</row>"
  width = data.reduce(((acc, row) -> Math.max acc, (row or []).length), 0)
  dimension =
    if data.length and width => "<dimension ref=\"A1:#{col-name(width - 1)}#{data.length}\"/>"
    else "<dimension ref=\"A1\"/>"
  """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">#dimension<sheetData>#{rows.join ''}</sheetData></worksheet>"""

# [content_types] must list every part, otherwise excel reports a corrupt file.
files = (data, options) ->
  name = sheet-name options.sheet-name
  [
    * name: '[Content_Types].xml'
      body: """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>"""
    * name: '_rels/.rels'
      body: """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>"""
    * name: 'xl/workbook.xml'
      body: """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="#{esc name}" sheetId="1" r:id="rId1"/></sheets></workbook>"""
    * name: 'xl/_rels/workbook.xml.rels'
      body: """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>"""
    # no styling is used, but excel expects a styles part to exist.
    * name: 'xl/styles.xml'
      body: """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>"""
    * name: 'xl/worksheets/sheet1.xml'
      body: sheet-xml data, options.force-text
  ]

# minimal STORE-mode zip writer ( no compression, no zip64 ).
zip = (entries, date) ->
  d = date or new Date!
  dos-time = ((d.getHours! .<<. 11) .|. (d.getMinutes! .<<. 5) .|. (d.getSeconds! .>>. 1)) .&. 0xffff
  dos-date = (((d.getFullYear! - 1980) .<<. 9) .|. ((d.getMonth! + 1) .<<. 5) .|. d.getDate!) .&. 0xffff

  items = entries.map (entry) ->
    name: utf8(entry.name), body: utf8(entry.body)

  local-size = items.reduce(((acc, it) -> acc + 30 + it.name.length + it.body.length), 0)
  central-size = items.reduce(((acc, it) -> acc + 46 + it.name.length), 0)
  buf = new Uint8Array(local-size + central-size + 22)
  view = new DataView(buf.buffer)
  pos = 0
  u16 = (v) -> view.setUint16 pos, v, true; pos := pos + 2
  u32 = (v) -> view.setUint32 pos, v, true; pos := pos + 4
  raw = (bytes) -> buf.set bytes, pos; pos := pos + bytes.length

  for it in items
    it.crc = crc32 it.body
    it.offset = pos
    u32 0x04034b50
    u16 20                  # version needed to extract
    u16 0x0800              # utf-8 encoded names
    u16 0                   # method: store
    u16 dos-time
    u16 dos-date
    u32 it.crc
    u32 it.body.length
    u32 it.body.length
    u16 it.name.length
    u16 0
    raw it.name
    raw it.body

  central-offset = pos
  for it in items
    u32 0x02014b50
    u16 20                  # version made by
    u16 20
    u16 0x0800
    u16 0
    u16 dos-time
    u16 dos-date
    u32 it.crc
    u32 it.body.length
    u32 it.body.length
    u16 it.name.length
    u16 0                   # extra field length
    u16 0                   # file comment length
    u16 0                   # disk number start
    u16 0                   # internal attributes
    u32 0                   # external attributes
    u32 it.offset
    raw it.name

  central-length = pos - central-offset
  u32 0x06054b50
  u16 0
  u16 0
  u16 items.length
  u16 items.length
  u32 central-length
  u32 central-offset
  u16 0
  buf

# convert a 2D array into xlsx bytes.
#
#  - options.forceText ( default true ): write every value as text, so excel
#    keeps leading zeros and long digit strings intact. set to false to let
#    numbers / booleans keep their native types.
#  - options.sheetName ( default "Sheet1" )
#  - options.date: timestamp stored in zip entries; useful for deterministic output.
xlsx = (data, options = {}) ->
  if !Array.isArray(data) => throw new Error("xlsx: data must be a 2D array")
  opt =
    force-text: if options.force-text? => !!options.force-text else true
    sheet-name: options.sheet-name
  zip files(data, opt), options.date

xlsx.mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

# this file is always bundled with index.ls ( see `build` ), which shares the
# same scope and does the exporting, so nothing is exported here.
