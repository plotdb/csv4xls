# according to https://stackoverflow.com/questions/155097
# convert utf-8 csv to utf-16le with BOM (0xff 0xfe )
# even with this, quoted newline only works
# if csv is opened by double clicking instead of text import wizard.
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
  to-blob: (data, delimiter = '\t') ->
    ba = obj.to-array(data, delimiter)
    mime-type = if delimiter == ',' then "text/csv" else "text/tab-separated-values"
    new Blob([ba], {type: mime-type})
  to-href: (data, delimiter = '\t') ->
    blob = obj.to-blob(data, delimiter)
    return URL.createObjectURL blob
  download: (data, name = "data", options = {delimiter: '\t'}) ->
    delimiter = options.delimiter or '\t'
    extension = if delimiter == ',' then '.csv' else '.tsv'
    href = @to-href data, delimiter
    a = document.createElement \a
    a.setAttribute \href, href
    a.setAttribute \download, name + (if new RegExp("\\#{extension}$", 'i').exec(name) => '' else extension)
    a.style.opacity = 0
    a.style.position = \absolute
    document.body.appendChild a
    a.click!
    document.body.removeChild a

csv4xls = (data, options = {delimiter: '\t'}) -> obj.to-href data, options.delimiter
csv4xls <<< obj

if module? => module.exports = csv4xls
else if window? => window.csv4xls = csv4xls
