# verify the builtin writer by reading the generated file back with sheetjs
# ( devDependency only - the library itself stays 0 dependency ).
require! <[assert]>
XLSX = require \xlsx
csv4xls = require \../dist/index.js

read = (bytes) ->
  wb = XLSX.read bytes, {type: \array}
  sheet: wb.SheetNames.0
  rows: XLSX.utils.sheet_to_json wb.Sheets[wb.SheetNames.0], {header: 1, raw: true}

data = [
  <[name id score flag]>
  ['Alice', '00123', 90, true]
  ['Bob', null, '中文"x"<y>&z', '']
  ['C']
]

# default: everything is text, so leading zeros and long digits survive.
ret = read csv4xls.to-xlsx data
assert.equal ret.sheet, \Sheet1
# skipped cells come back as holes, so compare in json form.
assert.equal JSON.stringify(ret.rows), JSON.stringify [
  <[name id score flag]>
  <[Alice 00123 90 true]>
  ['Bob', null, '中文"x"<y>&z']
  ['C']
]

# forceText: false keeps native number / boolean types.
ret = read csv4xls.to-xlsx data, {force-text: false, sheet-name: 'My Data'}
assert.equal ret.sheet, 'My Data'
assert.deep-equal ret.rows.1, ['Alice', '00123', 90, true]

# columns beyond Z must use two-letter refs.
wide = [["c#i" for i from 0 til 60]]
ret = read csv4xls.to-xlsx wide
assert.equal ret.rows.0.length, 60
assert.equal ret.rows.0[59], \c59

# degenerated inputs shouldn't produce a broken package.
assert.deep-equal read(csv4xls.to-xlsx []).rows, []
assert.throws (-> csv4xls.to-xlsx null), /2D array/

# the whole point of forceText: excel must not reinterpret any of these.
tricky = require \./tricky.ls
assert.equal JSON.stringify(read(csv4xls.to-xlsx tricky).rows), JSON.stringify(tricky)

console.log "xlsx: all tests passed."
