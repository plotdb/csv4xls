 (function() { function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {;pug_debug_line = 1;pug_debug_filename = "src\u002Fpug\u002Findex.pug";
pug_html = pug_html + "\u003C!DOCTYPE html\u003E";
;pug_debug_line = 2;pug_debug_filename = "src\u002Fpug\u002Findex.pug";
pug_html = pug_html + "\u003Chtml\u003E";
;pug_debug_line = 3;pug_debug_filename = "src\u002Fpug\u002Findex.pug";
pug_html = pug_html + "\u003Chead\u003E\u003C\u002Fhead\u003E";
;pug_debug_line = 4;pug_debug_filename = "src\u002Fpug\u002Findex.pug";
pug_html = pug_html + "\u003Cbody\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fpug\u002Findex.pug";
pug_html = pug_html + "\u003Ca id=\"link\" href=\"#\" download=\"output.csv\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "src\u002Fpug\u002Findex.pug";
pug_html = pug_html + "Click to Download CSV\u003C\u002Fa\u003E";
;pug_debug_line = 6;pug_debug_filename = "src\u002Fpug\u002Findex.pug";
pug_html = pug_html + "\u003Cscript src=\"\u002Fassets\u002Flib\u002Fcsv4xls\u002Fdev\u002Fcsv4xls.min.js\"\u003E\u003C\u002Fscript\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fpug\u002Findex.pug";
pug_html = pug_html + "\u003Cscript\u003E";
;pug_debug_line = 7;pug_debug_filename = "src\u002Fpug\u002Findex.pug";
pug_html = pug_html + "var content, data;\ncontent = \"隊老請……子賽究千以不等王把，麼和一德一質非，招她片過各，情度亞陽立目紀化館媽答識國過個長時變只與中代間氣方高結局企眼畫提這動裡北，方起知參南真業突眼車識細？市時媽用都是相看業。運到你改朋太還存選造此個回力在……我動計人園原戰去，個開業劇度假童方苦女量地的但養用小字作會不的使快導灣，層醫市時指時至買兒的臉夫接，兒相的多後空日告縣他各放不正來不運？我灣局節場道務要或友出自。正實的整不了毒。利全據養我報並信務約展成裡，不集人，和義合對不深電火心們人越聲就是臉去它適心，治要歡起不！語要多，識天車他書文個大……他度就始下麼首他！那中越清頭腦同任半早良在，服我爸頭常度，居知大系麗片……具信福走功了以養滿信小作場平。知把科失始子操當健戰在，港筆林內狀去青起以出聲是音在也實。言照導經食術流相是生情書真放相力海有臺成義。朋他筆法他甚，飛朋文自：月風展師。議工知傷大……上者準收、怕的也裡要汽眾，一說種，起喜水有同戲要，市因收取了的合次養找問夫由處和候引星果解爭修。\";\ndata = (function(){\n  var i$, to$, results$ = [];\n  for (i$ = 0, to$ = Math.round(10 * Math.random() + 10); i$ \u003C to$; ++i$) {\n    results$.push(i$);\n  }\n  return results$;\n}()).map(function(){\n  return (function(){\n    var i$, to$, results$ = [];\n    for (i$ = 0, to$ = Math.round(10 * Math.random() + 10); i$ \u003C to$; ++i$) {\n      results$.push(i$);\n    }\n    return results$;\n  }()).map(function(){\n    var x, len;\n    x = Math.round(Math.random() * content.length \u002F 2);\n    len = Math.round(Math.random() * (content.length - x - 10) \u002F 2 + 5);\n    return content.substring(x, len);\n  });\n});\nlink.setAttribute('href', csv4xls.toHref(data));\u003C\u002Fscript\u003E\u003C\u002Fbody\u003E\u003C\u002Fhtml\u003E";} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line);};return pug_html;}; module.exports = template; })() 