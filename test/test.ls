require! <[fs puppeteer]>
lc = {}
code = fs.read-file-sync('dist/main.js').toString!
puppeteer.launch!
  .then (browser) ->
    lc.browser = browser
    browser.newPage!
  .then (page) ->

    page.on \console, (msg) ->
      for m in msg._args => console.log m.toString!

    lc.page = page
    page.setContent """
    <script>
    #code
    </script>
    """
    lc.page.evaluate ->
      url = csv4xls([[1,2],[3,4]])
      array = csv4xls.to-array([[1,2],[3,4]])
      fetch(url, {method: "GET"})
        .then -> it.blob!
        .then ->
          it.arrayBuffer!
        .then (ab) ->
          ui = new Uint8Array(ab)
          ret = ui.length != array.length or ([ui[i] == array[i] for i from 0 til ui.length].filter(-> !it).length)
          console.log if ret => "not matched" else "matched"

    
  .then ->
    lc.browser.close!

