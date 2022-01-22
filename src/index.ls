# according to https://stackoverflow.com/questions/155097
# convert utf-8 csv to utf-16le with BOM (0xff 0xfe )
# even with this, quoted newline only works
# if csv is opened by double clicking instead of text import wizard.
obj = do
  to-array: (data) ->
    str = data.map((d,i) -> d.map((v,j) -> "#v").join(\\t)).join('\r\n')
    str = data
      .map (d,i) ->
        d
          .map (v,j) -> '"' + ('' + v).replace(/"/g, '""').replace(/\n/g,'\r') + '"'
          .join '\t'
      .join '\r\n'

    ba = new Uint8Array(2 + str.length * 2)
    for i from 0 til str.length
      ba[i * 2 + 2] = str.charCodeAt i
      ba[i * 2 + 3] = str.charCodeAt(i) .>>. 8
    ba[0] = 0xff
    ba[1] = 0xfe
    return ba
  to-blob: (data) ->
    ba = obj.to-array(data)
    new Blob([ba], {type: "text/csv"})
  to-href: (data) ->
    blob = obj.to-blob(data)
    return URL.createObjectURL blob
  download: (data, name = "data.csv") ->
    href = @to-href data
    a = document.createElement \a
    a.setAttribute \href, href
    a.setAttribute \download, name + (if /\.csv$/i.exec(name) => '' else \.csv)
    a.style.opacity = 0
    a.style.position = \absolute
    document.body.appendChild a
    a.click!
    document.body.removeChild a

csv4xls = -> obj.to-href it
csv4xls <<< obj

if module? => module.exports = csv4xls
else if window? => window.csv4xls = csv4xls
