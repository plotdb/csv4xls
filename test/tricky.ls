# values that excel likes to auto-convert when they come from csv/tsv:
# "3-1" becomes a date, "00123" loses its zeros, long digits turn into
# scientific notation, "=1+1" becomes a formula, and so on.
#
# used by test/xlsx.ls, and `lsc test/tricky.ls` regenerates test/tricky.xlsx
# so the result can be eyeballed in a real excel.
require! <[fs path]>

rows = [
  <[case value]>
  ['dash', '3-1']
  ['date-ish', '2026/8/11']
  ['zero-pad', '00123']
  ['long digits', '1234567890123456789']
  ['sci', '1E5']
  ['phone', '0912-345-678']
  ['ratio', '1:2']
  ['formula-ish', '=1+1']
  ['plus', '+886']
  ['spaced', ' 007 ']
]

module.exports = rows

if require.main == module
  csv4xls = require \../dist/index.js
  file = path.join __dirname, \tricky.xlsx
  fs.write-file-sync file, csv4xls.to-xlsx(rows)
  console.log "written: #file"
