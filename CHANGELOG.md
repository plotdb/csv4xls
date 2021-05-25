# v0.1.0

 - add `download` api for trigger csv download directly.


# v0.0.2

 - quote double quote properly by converting single double quote to double double quote.
 - quote all values when preparing csv strings from array to prevent from unexpected line-break or delimiter char.
 - use CR (carriage Return, \\r) to all replace LF (line feed, \\n) since excel seems prefer \\r over \\n.

