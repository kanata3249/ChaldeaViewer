//
// convert atlas academy servant(JP) json to costume json
//
// Usage: gensostume.js atlas.json costume.csv
//
// expected data from
//   https://api.atlasacademy.io/export/JP/nice_servant.json
//   and
//   https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=675248781&tqx=out:csv
//

csv = require('csvtojson')
fs = require('fs')

const csv2json = async (file) => {
  return await csv({checkType:true}).fromFile(file)
}

const itemNames = {
    200: "剣の輝石",
    201: "弓の輝石",
    202: "槍の輝石",
    203: "騎の輝石",
    204: "術の輝石",
    205: "殺の輝石",
    206: "狂の輝石",
    
    210: "剣の魔石",
    211: "弓の魔石",
    212: "槍の魔石",
    213: "騎の魔石",
    214: "術の魔石",
    215: "殺の魔石",
    216: "狂の魔石",
    
    220: "剣の秘石",
    221: "弓の秘石",
    222: "槍の秘石",
    223: "騎の秘石",
    224: "術の秘石",
    225: "殺の秘石",
    226: "狂の秘石",
    
    300: "英雄の証",
    301: "凶骨",
    302: "竜の牙",
    303: "虚影の塵",
    304: "愚者の鎖",
    305: "万死の毒針",
    306: "魔術髄液",
    307: "宵哭きの鉄杭",
    308: "励振火薬",
    309: "赦免の小鐘",
    
    400: "世界樹の種",
    401: "ゴーストランタン",
    402: "八連双晶",
    403: "蛇の宝玉",
    404: "鳳凰の羽根",
    405: "無間の歯車",
    406: "禁断の頁",
    407: "ホムンクルスベビー",
    408: "隕蹄鉄",
    409: "大騎士勲章",
    410: "追憶の貝殻",
    411: "枯淡勾玉",
    412: "永遠結氷",
    413: "巨人の指輪",
    414: "オーロラ鋼",
    415: "閑古鈴",
    416: "禍罪の矢尻",
    417: "光銀の冠",
    418: "神脈霊子",
    419: "虹の糸玉",
    420: "夢幻の鱗粉",
    
    500: "混沌の爪",
    501: "蛮神の心臓",
    502: "竜の逆鱗",
    503: "精霊根",
    504: "戦馬の幼角",
    505: "血の涙石",
    506: "黒獣脂",
    507: "封魔のランプ",
    508: "智慧のスカラベ",
    509: "原初の産毛",
    510: "呪獣胆石",
    511: "奇奇神酒",
    512: "暁光炉心",
    513: "九十九鏡",
    514: "真理の卵",
    515: "煌星のカケラ",
    516: "悠久の実",
    517: "鬼炎鬼灯",
    
    600: "セイバーピース",
    601: "アーチャーピース",
    602: "ランサーピース",
    603: "ライダーピース",
    604: "キャスターピース",
    605: "アサシンピース",
    606: "バーサーカーピース",
    
    610: "セイバーモニュメント",
    611: "アーチャーモニュメント",
    612: "ランサーモニュメント",
    613: "ライダーモニュメント",
    614: "キャスターモニュメント",
    615: "アサシンモニュメント",
    616: "バーサーカーモニュメント",
    
    800: "伝承結晶",
    
    900: "QP",
}
    
const itemName2Id = Object.keys(itemNames).reduce((acc, id) => {
    acc[itemNames[id]] = id
    return acc
}, {})

Promise.all([csv2json(process.argv[3])]).then(([costume_array]) => {
    const aid2id = {}
    const costumes = costume_array.reduce((acc, row) => {
        acc[row.id] = {
            id: row.id,
            name: row.name,
            servantId: row.servantId,
            items: {},
        }

        aid2id[row.aid] = row.id
        return acc
    }, {})

    // get item data from atlas json
    const atlasjson = JSON.parse(fs.readFileSync(process.argv[2]))
    atlasjson.forEach((servantData) => {
        const id = servantData.collectionNo
        if (Object.keys(servantData.costumeMaterials).length) {
            Object.keys(servantData.costumeMaterials).forEach((aid) => {
                const items = servantData.costumeMaterials[aid].items.reduce((acc, item) => {
                    acc[itemName2Id[item.item.name]] = item.amount
                    return acc
                }, {})
                items[itemName2Id["QP"]] = servantData.costumeMaterials[aid].qp / 10000
                if (costumes[aid2id[aid]]) {
                    costumes[aid2id[aid]].items = items
                } else {
                    console.log(`${id}\t${aid}\t${Object.keys(items).map((itemId) => `${itemNames[itemId]}\t${items[itemId]}`).join('\t')}`)
                }
            })
        }
    })

    try {
        fs.writeFileSync("costumes.json",  JSON.stringify(costumes))
      } catch (e) {
        console.log(e)
      }
})
