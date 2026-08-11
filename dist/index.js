(function(){
var crcTable, crc32, utf8, esc, colName, sheetName, cell, sheetXml, files, zip, xlsx;
crcTable = function(){
  var ret, i$, n, c, j$, _;
  ret = new Uint32Array(256);
  for (i$ = 0; i$ < 256; ++i$) {
    n = i$;
    c = n;
    for (j$ = 0; j$ < 8; ++j$) {
      _ = j$;
      c = c & 1
        ? (0xEDB88320 ^ c >>> 1) >>> 0
        : c >>> 1;
    }
    ret[n] = c >>> 0;
  }
  return ret;
}();
crc32 = function(bytes){
  var c, i$, to$, i;
  c = 0xFFFFFFFF;
  for (i$ = 0, to$ = bytes.length; i$ < to$; ++i$) {
    i = i$;
    c = (crcTable[(c ^ bytes[i]) & 0xff] ^ c >>> 8) >>> 0;
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
};
utf8 = function(str){
  var bytes, i$, to$, i, c, c2, cp;
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  bytes = [];
  for (i$ = 0, to$ = str.length; i$ < to$; ++i$) {
    i = i$;
    c = str.charCodeAt(i);
    if (c < 0x80) {
      bytes.push(c);
    } else if (c < 0x800) {
      bytes.push(0xc0 | c >> 6, 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      c2 = str.charCodeAt(i + 1);
      cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      i = i + 1;
      bytes.push(0xf0 | cp >> 18, 0x80 | (cp >> 12 & 0x3f), 0x80 | (cp >> 6 & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      bytes.push(0xe0 | c >> 12, 0x80 | (c >> 6 & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(bytes);
};
esc = function(v){
  return ('' + v).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};
colName = function(idx){
  var ret, n;
  ret = '';
  n = idx;
  for (;;) {
    ret = String.fromCharCode(65 + n % 26) + ret;
    n = Math.floor(n / 26) - 1;
    if (n < 0) {
      break;
    }
  }
  return ret;
};
sheetName = function(name){
  var ret;
  ret = ('' + (name || 'Sheet1')).replace(/[\[\]:*?\/\\]/g, ' ').substring(0, 31);
  if (ret.trim()) {
    return ret;
  } else {
    return 'Sheet1';
  }
};
cell = function(v, ref, forceText){
  var s;
  if (v == null || v === '') {
    return '';
  }
  if (!forceText) {
    if (typeof v === 'number') {
      if (!isFinite(v)) {
        return '';
      }
      return "<c r=\"" + ref + "\"><v>" + v + "</v></c>";
    }
    if (typeof v === 'boolean') {
      return "<c r=\"" + ref + "\" t=\"b\"><v>" + (v ? 1 : 0) + "</v></c>";
    }
  }
  s = v instanceof Date
    ? v.toISOString()
    : '' + v;
  return "<c r=\"" + ref + "\" t=\"inlineStr\"><is><t xml:space=\"preserve\">" + esc(s) + "</t></is></c>";
};
sheetXml = function(data, forceText){
  var rows, res$, i$, len$, i, row, cells, res1$, j$, ref$, len1$, j, v, width, dimension;
  res$ = [];
  for (i$ = 0, len$ = data.length; i$ < len$; ++i$) {
    i = i$;
    row = data[i$];
    res1$ = [];
    for (j$ = 0, len1$ = (ref$ = row || []).length; j$ < len1$; ++j$) {
      j = j$;
      v = ref$[j$];
      res1$.push(cell(v, colName(j) + (i + 1), forceText));
    }
    cells = res1$;
    res$.push("<row r=\"" + (i + 1) + "\">" + cells.join('') + "</row>");
  }
  rows = res$;
  width = data.reduce(function(acc, row){
    return Math.max(acc, (row || []).length);
  }, 0);
  dimension = data.length && width ? "<dimension ref=\"A1:" + colName(width - 1) + data.length + "\"/>" : "<dimension ref=\"A1\"/>";
  return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">" + dimension + "<sheetData>" + rows.join('') + "</sheetData></worksheet>";
};
files = function(data, options){
  var name;
  name = sheetName(options.sheetName);
  return [
    {
      name: '[Content_Types].xml',
      body: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/><Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/><Override PartName=\"/xl/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\"/></Types>"
    }, {
      name: '_rels/.rels',
      body: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/></Relationships>"
    }, {
      name: 'xl/workbook.xml',
      body: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\"><sheets><sheet name=\"" + esc(name) + "\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>"
    }, {
      name: 'xl/_rels/workbook.xml.rels',
      body: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/><Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/></Relationships>"
    }, {
      name: 'xl/styles.xml',
      body: "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"><fonts count=\"1\"><font><sz val=\"11\"/><name val=\"Calibri\"/></font></fonts><fills count=\"1\"><fill><patternFill patternType=\"none\"/></fill></fills><borders count=\"1\"><border/></borders><cellStyleXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/></cellStyleXfs><cellXfs count=\"1\"><xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\"/></cellXfs></styleSheet>"
    }, {
      name: 'xl/worksheets/sheet1.xml',
      body: sheetXml(data, options.forceText)
    }
  ];
};
zip = function(entries, date){
  var d, dosTime, dosDate, items, localSize, centralSize, buf, view, pos, u16, u32, raw, i$, len$, it, centralOffset, centralLength;
  d = date || new Date();
  dosTime = (d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() >> 1) & 0xffff;
  dosDate = (d.getFullYear() - 1980 << 9 | d.getMonth() + 1 << 5 | d.getDate()) & 0xffff;
  items = entries.map(function(entry){
    return {
      name: utf8(entry.name),
      body: utf8(entry.body)
    };
  });
  localSize = items.reduce(function(acc, it){
    return acc + 30 + it.name.length + it.body.length;
  }, 0);
  centralSize = items.reduce(function(acc, it){
    return acc + 46 + it.name.length;
  }, 0);
  buf = new Uint8Array(localSize + centralSize + 22);
  view = new DataView(buf.buffer);
  pos = 0;
  u16 = function(v){
    view.setUint16(pos, v, true);
    return pos = pos + 2;
  };
  u32 = function(v){
    view.setUint32(pos, v, true);
    return pos = pos + 4;
  };
  raw = function(bytes){
    buf.set(bytes, pos);
    return pos = pos + bytes.length;
  };
  for (i$ = 0, len$ = items.length; i$ < len$; ++i$) {
    it = items[i$];
    it.crc = crc32(it.body);
    it.offset = pos;
    u32(0x04034b50);
    u16(20);
    u16(0x0800);
    u16(0);
    u16(dosTime);
    u16(dosDate);
    u32(it.crc);
    u32(it.body.length);
    u32(it.body.length);
    u16(it.name.length);
    u16(0);
    raw(it.name);
    raw(it.body);
  }
  centralOffset = pos;
  for (i$ = 0, len$ = items.length; i$ < len$; ++i$) {
    it = items[i$];
    u32(0x02014b50);
    u16(20);
    u16(20);
    u16(0x0800);
    u16(0);
    u16(dosTime);
    u16(dosDate);
    u32(it.crc);
    u32(it.body.length);
    u32(it.body.length);
    u16(it.name.length);
    u16(0);
    u16(0);
    u16(0);
    u16(0);
    u32(0);
    u32(it.offset);
    raw(it.name);
  }
  centralLength = pos - centralOffset;
  u32(0x06054b50);
  u16(0);
  u16(0);
  u16(items.length);
  u16(items.length);
  u32(centralLength);
  u32(centralOffset);
  u16(0);
  return buf;
};
xlsx = function(data, options){
  var opt;
  options == null && (options = {});
  if (!Array.isArray(data)) {
    throw new Error("xlsx: data must be a 2D array");
  }
  opt = {
    forceText: options.forceText != null ? !!options.forceText : true,
    sheetName: options.sheetName
  };
  return zip(files(data, opt), options.date);
};
xlsx.mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
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
    delimiter: {
      csv: ',',
      tsv: '\t'
    }[opt.format] || opt.delimiter || '\t',
    forceText: opt.forceText != null ? !!opt.forceText : true,
    engine: opt.engine === 'sheetjs' ? 'sheetjs' : 'builtin'
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
    var ref$, forceText, engine, workbook;
    options == null && (options = {});
    ref$ = parseOption(options), forceText = ref$.forceText, engine = ref$.engine;
    if (engine !== 'sheetjs') {
      return xlsx(data, {
        forceText: forceText,
        sheetName: options.sheetName
      });
    }
    if (!hasXlsx()) {
      throw new Error("XLSX module not found. Please include xlsx.js in your project.");
    }
    workbook = obj.toWorkbook(data, {
      forceText: forceText
    });
    return new Uint8Array(XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx'
    }));
  },
  toWorkbook: function(data, options){
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
    var ref$, format, delimiter, forceText, engine, buffer, e, html, ba, i$, to$, i, mimeType;
    options == null && (options = {
      delimiter: undefined,
      format: 'auto',
      forceText: true
    });
    ref$ = parseOption(options), format = ref$.format, delimiter = ref$.delimiter, forceText = ref$.forceText, engine = ref$.engine;
    if (format === 'xlsx' || format === 'auto') {
      try {
        buffer = obj.toXlsx(data, options);
        return new Blob([buffer], {
          type: xlsx.mimetype
        });
      } catch (e$) {
        e = e$;
        console.error("Failed to create XLSX: ", e);
        throw e;
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
      forceText: true
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
      forceText: true
    });
    ref$ = parseOption(options), format = ref$.format, delimiter = ref$.delimiter, forceText = ref$.forceText;
    extension = format === 'xlsx' || format === 'auto'
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
    forceText: true
  });
  return obj.toHref(data, options);
};
import$(csv4xls, obj);
csv4xls.xlsx = xlsx;
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
