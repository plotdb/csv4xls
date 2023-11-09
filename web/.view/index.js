 (function() { function pug_attr(t,e,n,r){if(!1===e||null==e||!e&&("class"===t||"style"===t))return"";if(!0===e)return" "+(r?t:t+'="'+t+'"');var f=typeof e;return"object"!==f&&"function"!==f||"function"!=typeof e.toJSON||(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||-1===e.indexOf('"'))?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;
    var locals_for_with = (locals || {});
    
    (function (libLoader, version) {
      pug_html = pug_html + "\u003C!DOCTYPE html\u003E";
if(!libLoader) {
  libLoader = {
    js: {url: {}},
    css: {url: {}},
    root: function(r) { libLoader._r = r; },
    _r: "/assets/lib",
    _v: "",
    version: function(v) { libLoader._v = (v ? "?v=" + v : ""); }
  }
  if(version) { libLoader.version(version); }
}























































































pug_html = pug_html + "\u003Chtml\u003E\u003Chead\u003E\u003C\u002Fhead\u003E\u003Cbody\u003E\u003Ca id=\"link\" href=\"#\" download=\"output.csv\"\u003EClick to Download CSV\u003C\u002Fa\u003E\u003Cscript src=\"\u002Fassets\u002Flib\u002Fcsv4xls\u002Fdev\u002Findex.min.js\"\u003E\u003C\u002Fscript\u003E\u003Cscript type=\"module\"\u003Evar content,data;content=\"隊老請……子賽究千以不等王把，麼和一德一質非，招她片過各，情度亞陽立目紀化館媽答識國過個長時變只與中代間氣方高結局企眼畫提這動裡北，方起知參南真業突眼車識細？市時媽用都是相看業。運到你改朋太還存選造此個回力在……我動計人園原戰去，個開業劇度假童方苦女量地的但養用小字作會不的使快導灣，層醫市時指時至買兒的臉夫接，兒相的多後空日告縣他各放不正來不運？我灣局節場道務要或友出自。正實的整不了毒。利全據養我報並信務約展成裡，不集人，和義合對不深電火心們人越聲就是臉去它適心，治要歡起不！語要多，識天車他書文個大……他度就始下麼首他！那中越清頭腦同任半早良在，服我爸頭常度，居知大系麗片……具信福走功了以養滿信小作場平。知把科失始子操當健戰在，港筆林內狀去青起以出聲是音在也實。言照導經食術流相是生情書真放相力海有臺成義。朋他筆法他甚，飛朋文自：月風展師。議工知傷大……上者準收、怕的也裡要汽眾，一說種，起喜水有同戲要，市因收取了的合次養找問夫由處和候引星果解爭修。\";data=function(){var t,n,r=[];for(t=0,n=Math.round(10*Math.random()+10);t\u003Cn;++t){r.push(t)}return r}().map(function(){return function(){var t,n,r=[];for(t=0,n=Math.round(10*Math.random()+10);t\u003Cn;++t){r.push(t)}return r}().map(function(){var t,n;t=Math.round(Math.random()*content.length\u002F2);n=Math.round(Math.random()*(content.length-t-10)\u002F2+5);return content.substring(t,n)})});link.setAttribute(\"href\",csv4xls.toHref(data));console.log(csv4xls.toString(data));\u003C\u002Fscript\u003E\u003C\u002Fbody\u003E\u003C\u002Fhtml\u003E";
    }.call(this, "libLoader" in locals_for_with ?
        locals_for_with.libLoader :
        typeof libLoader !== 'undefined' ? libLoader : undefined, "version" in locals_for_with ?
        locals_for_with.version :
        typeof version !== 'undefined' ? version : undefined));
    ;;return pug_html;}; module.exports = template; })() 