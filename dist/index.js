(function(){
  var obj, csv4xls;
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
    toBlob: function(data, delimiter){
      var ba, mimeType;
      delimiter == null && (delimiter = '\t');
      ba = obj.toArray(data, delimiter);
      mimeType = delimiter === ',' ? "text/csv" : "text/tab-separated-values";
      return new Blob([ba], {
        type: mimeType
      });
    },
    toHref: function(data, delimiter){
      var blob;
      delimiter == null && (delimiter = '\t');
      blob = obj.toBlob(data, delimiter);
      return URL.createObjectURL(blob);
    },
    download: function(data, name, options){
      var delimiter, extension, href, a;
      name == null && (name = "data");
      options == null && (options = {
        delimiter: '\t'
      });
      delimiter = options.delimiter || '\t';
      extension = delimiter === ',' ? '.csv' : '.tsv';
      href = this.toHref(data, delimiter);
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
      delimiter: '\t'
    });
    return obj.toHref(data, options.delimiter);
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
