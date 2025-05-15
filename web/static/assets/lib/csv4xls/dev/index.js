(function(){
  var hasXlsx, obj, csv4xls;
  hasXlsx = function(){
    var e;
    try {
      return typeof XLSX !== 'undefined';
    } catch (e$) {
      e = e$;
      return false;
    }
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
    toXlsx: function(data){
      var workbook, worksheet;
      if (!hasXlsx()) {
        throw new Error("XLSX module not found. Please include xlsx.js in your project.");
      }
      workbook = XLSX.utils.book_new();
      worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      return workbook;
    },
    toBlob: function(data, options){
      var delimiter, format, workbook, buffer, e, ba, mimeType;
      options == null && (options = {
        delimiter: '\t',
        format: 'auto'
      });
      delimiter = options.delimiter || '\t';
      format = options.format || 'auto';
      if (format === 'xlsx' || (format === 'auto' && hasXlsx())) {
        try {
          workbook = obj.toXlsx(data);
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
      ba = obj.toArray(data, delimiter);
      mimeType = delimiter === ',' ? "text/csv" : "text/tab-separated-values";
      return new Blob([ba], {
        type: mimeType
      });
    },
    toHref: function(data, options){
      var blob;
      options == null && (options = {
        delimiter: '\t',
        format: 'auto'
      });
      blob = obj.toBlob(data, options);
      return URL.createObjectURL(blob);
    },
    download: function(data, name, options){
      var delimiter, format, extension, e, href, a;
      name == null && (name = "data");
      options == null && (options = {
        delimiter: '\t',
        format: 'auto'
      });
      delimiter = options.delimiter || '\t';
      format = options.format || 'auto';
      extension = format === 'xlsx' || (format === 'auto' && hasXlsx())
        ? (function(){
          try {
            return '.xlsx';
          } catch (e$) {
            e = e$;
            if (delimiter === ',') {
              return '.csv';
            } else {
              return '.tsv';
            }
          }
        }())
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
    }
  };
  csv4xls = function(data, options){
    options == null && (options = {
      delimiter: '\t',
      format: 'auto'
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
