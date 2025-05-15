content = '''隊老"!!!""請…"…"子賽究千以"不等王把，"""麼和一"德一質非，"招"她片過"各，情度亞"陽立"目紀"化館媽答識"國過個"長"時變只與中"代間氣方""高結局企眼"畫提這動裡""北，方起"知參南真業"突"眼車識"細？市時媽"用都"是相"看業。運到"你改朋'太"還存選造此"個回力在'"……我動計"人園原戰去"'，個開業"劇度假童方"苦'女量地"的但養用小"字作'會不"的使快導灣"，層醫'市"時指時至買"兒的臉夫'"接，兒相的"多後空日告"'縣他各放"不正來不運"？'我灣局"節場道務要"或友'出自"。正實的整"不了毒'。"利全據養我"報並信務'"約展成裡，"不集人"，"和義合對不"深電"火心"們人越聲就"是"臉去它"適心，治要""歡起不！"語要多，""識天車他書"文個大"…"…他度就始"下麼"首他"！那中越清"頭"腦同任"半早良在，""服我爸頭"常度，居""知大系麗片"……具"信"福走功了以"養滿"信小"作場平。知"把"科失始"子操當健戰""在，港筆"林內狀去""青起以出聲"是音在"也"實。言照導"經食"術流"相是生情書"真"放相力"海有臺成義""。朋他筆"法他甚，""飛朋文自："月風展"'"師。議工知"傷大……上"者準收、怕"的也裡要汽"眾，一說種"，起喜水有"同戲要，市"因收取了的"合次養找問"夫由處和候"引星果解爭"修。'''

data = []
[rows, cols] = [30 + Math.ceil(20 * Math.random!), 15 + Math.ceil(10 * Math.random!)]
types = [0 til cols].map -> if Math.random! > 0.5 => \t else \n
for i from 0 til rows
  line = []
  for j from 0 til cols
    x = Math.round(Math.random! * content.length / 2)
    len = Math.round(Math.random! * (content.length - x - 10) / 2  + 5) <? 20
    line.push(
      if types[j] == \n => Math.round(Math.random! * 1000)
      else content.substring(x,x + len)
    )
  data.push line

linktsv.setAttribute \href, csv4xls.to-href(data, delimiter: ',')
linkxlsx.setAttribute \href, csv4xls.to-href(data, format: 'xlsx')
console.log csv4xls.to-string(data)
console.log data
