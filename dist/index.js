(function(){
  var hasXlsx, parseOption, obj, csv4xls;
  hasXlsx = function(){
    var e;
    try {
      return typeof XLSX !== 'undefined';
    } catch (e$) {
      e = e$;
      return false;
    }
  };
  parseOption = function(opt){
    opt == null && (opt = {});
    return {
      format: opt.format || 'auto',
      delimiter: opt.delimiter || ({
        csv: ',',
        tsv: 't'
      }[opt.format] || 't'),
      forceText: opt.forceText || false
    };
  };
  obj = {
    toString: function(data, delimiter){
      var str;
      delimiter == null && (delimiter = '\t');
      str = data.map(function(d, i){
        return d.map(function(v, j){
          return v + "";
        }).join(delimiter);
      }).join('\r\n');
      return str = data.map(function(d, i){
        return d.map(function(v, j){
          return '"' + ('' + v).replace(/"/g, '""').replace(/\n/g, '\r') + '"';
        }).join(delimiter);
      }).join('\r\n');
    },
    toArray: function(data, delimiter){
      var str, ba, i$, to$, i;
      delimiter == null && (delimiter = '\t');
      str = obj.toString(data, delimiter);
      ba = new Uint8Array(2 + str.length * 2);
      for (i$ = 0, to$ = str.length; i$ < to$; ++i$) {
        i = i$;
        ba[i * 2 + 2] = str.charCodeAt(i);
        ba[i * 2 + 3] = str.charCodeAt(i) >> 8;
      }
      ba[0] = 0xff;
      ba[1] = 0xfe;
      return ba;
    },
    toXlsx: function(data, options){
      var workbook, worksheet, addr;
      options == null && (options = {});
      if (!hasXlsx()) {
        throw new Error("XLSX module not found. Please include xlsx.js in your project.");
      }
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet(data);
      if (options.forceText) {
        for (addr in worksheet) {
          if (addr[0] !== '!') {
            if (worksheet[addr] != null) {
              worksheet[addr].t = 's';
            }
          }
        }
      }
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      return workbook;
    },
    toBlob: function(data, options){
      var ref$, format, delimiter, forceText, workbook, buffer, e, html, ba, i$, to$, i, mimeType;
      options == null && (options = {
        delimiter: undefined,
        format: 'auto',
        forceText: false
      });
      ref$ = parseOption(options), format = ref$.format, delimiter = ref$.delimiter, forceText = ref$.forceText;
      if (format === 'xlsx' || (format === 'auto' && hasXlsx())) {
        try {
          workbook = obj.toXlsx(data, {
            forceText: forceText
          });
          buffer = XLSX.write(workbook, {
            type: 'array',
            bookType: 'xlsx'
          });
          return new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          });
        } catch (e$) {
          e = e$;
          console.warn("Failed to create XLSX. Falling back to CSV/TSV format.", e);
        }
      }
      if (format === 'html') {
        html = obj.toHtml(data, options.html || {});
        return new Blob([html], {
          type: "text/html"
        });
      }
      if (format === 'xls-html') {
        html = obj.toHtml(data, options.html || {});
        ba = new Uint8Array(2 + html.length * 2);
        ba[0] = 0xff;
        ba[1] = 0xfe;
        for (i$ = 0, to$ = html.length; i$ < to$; ++i$) {
          i = i$;
          ba[i * 2 + 2] = html.charCodeAt(i);
          ba[i * 2 + 3] = html.charCodeAt(i) >> 8;
        }
        return new Blob([ba], {
          type: "application/vnd.ms-excel"
        });
      }
      ba = obj.toArray(data, delimiter);
      mimeType = delimiter === ',' ? "text/csv" : "text/tab-separated-values";
      return new Blob([ba], {
        type: mimeType
      });
    },
    toHref: function(data, options){
      var blob;
      options == null && (options = {
        delimiter: undefined,
        format: 'auto',
        forceText: false
      });
      blob = obj.toBlob(data, options);
      return URL.createObjectURL(blob);
    },
    download: function(data, name, options){
      var ref$, format, delimiter, forceText, extension, href, a;
      name == null && (name = "data");
      options == null && (options = {
        delimiter: undefined,
        format: 'auto',
        forceText: false
      });
      ref$ = parseOption(options), format = ref$.format, delimiter = ref$.delimiter, forceText = ref$.forceText;
      extension = format === 'xlsx' || (format === 'auto' && hasXlsx())
        ? '.xlsx'
        : format === 'html'
          ? '.html'
          : format === 'xls-html'
            ? '.xls'
            : delimiter === ',' ? '.csv' : '.tsv';
      href = this.toHref(data, options);
      a = document.createElement('a');
      a.setAttribute('href', href);
      a.setAttribute('download', name + (new RegExp("\\" + extension + "$", 'i').exec(name) ? '' : extension));
      a.style.opacity = 0;
      a.style.position = 'absolute';
      document.body.appendChild(a);
      a.click();
      return document.body.removeChild(a);
    },
    toHtml: function(data, options){
      var opts, html, i$, len$, i, row, isHeader, tag, j$, len1$, cell, style, safeCell;
      options == null && (options = {});
      opts = {
        tableClass: options.tableClass || 'csv4xls-table',
        cellStyle: options.cellStyle || true,
        headerRow: options.headerRow || false
      };
      html = "<table class=\"" + opts.tableClass + "\">";
      for (i$ = 0, len$ = data.length; i$ < len$; ++i$) {
        i = i$;
        row = data[i$];
        isHeader = opts.headerRow && i === 0;
        tag = isHeader ? 'th' : 'td';
        html += "<tr>";
        for (j$ = 0, len1$ = row.length; j$ < len1$; ++j$) {
          cell = row[j$];
          style = opts.cellStyle ? ' style="mso-number-format:\'\\@\';"' : '';
          safeCell = ('' + cell).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
          html += "<" + tag + style + ">" + safeCell + "</" + tag + ">";
        }
        html += "</tr>";
      }
      html += "</table>";
      return html;
    }
  };
  csv4xls = function(data, options){
    options == null && (options = {
      delimiter: undefined,
      format: 'auto',
      forceText: false
    });
    return obj.toHref(data, options);
  };
  import$(csv4xls, obj);
  if (typeof module != 'undefined' && module !== null) {
    module.exports = csv4xls;
  } else if (typeof window != 'undefined' && window !== null) {
    window.csv4xls = csv4xls;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
