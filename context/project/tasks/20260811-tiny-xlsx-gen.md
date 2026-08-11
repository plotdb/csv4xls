可以，目標可以整理成這樣：

你要做一個 **0 dependency 的 JavaScript function**：

```js
jsonToXlsx(data)
```

或更精確一點：

```js
arrayToXlsx(rows)
```

輸入是 **2D JS array**：

```js
[
  ["name", "id", "score"],
  ["Alice", "00123", 90],
  ["Bob", "00124", 85]
]
```

輸出是一個可下載或寫檔的 `.xlsx` 內容，例如 Browser 回傳 `Blob`，Node 則可以回傳 `Uint8Array`。

實作方向是：

```text
2D JS array
→ 產生最小必要 OOXML
→ 自己組 ZIP container
→ ZIP 使用 STORE mode，不做壓縮
→ 輸出 .xlsx
```

關鍵是：**XLSX 本身就是 ZIP + XML**，但 ZIP 裡的檔案不一定要真的壓縮，所以可以完全不依賴 `fflate`、`JSZip`、`xlsx`。

最小 XLSX 大概需要這些檔案：

```text
[Content_Types].xml
_rels/.rels
xl/workbook.xml
xl/_rels/workbook.xml.rels
xl/worksheets/sheet1.xml
```

甚至可以不用 `sharedStrings.xml`，直接使用 **inline string**，這樣實作更簡單。

cell type 可以直接依 JS type 產生：

```text
string  → inlineStr
number  → number
boolean → boolean
null    → empty cell
```

像：

```js
"00123"
```

會明確輸出成 Excel string，因此不會像 CSV 一樣被 Excel 自動變成 `123`。

ZIP 部分自己寫最小 writer，需要處理：

```text
Local File Header
File Data
Central Directory Header
End of Central Directory
CRC32
```

因為使用 `STORE`，不需要實作 DEFLATE，真正需要額外寫的演算法基本上只有 **CRC32**。

所以整個 function 可以做到：

```js
const blob = arrayToXlsx(rows);
```

Browser：

```js
const url = URL.createObjectURL(blob);
```

而且是 **純 JS、0 dependency、真正 `.xlsx`、Excel 可直接開**。

