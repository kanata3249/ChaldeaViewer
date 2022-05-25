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

itemAliasNames = {
    "剣ピース": "セイバーピース",
    "弓ピース": "アーチャーピース",
    "槍ピース": "ランサーピース",
    "騎ピース": "ライダーピース",
    "術ピース": "キャスターピース",
    "殺ピース": "アサシンピース",
    "狂ピース": "バーサーカーピース",

    "剣モニュメント": "セイバーモニュメント",
    "弓モニュメント": "アーチャーモニュメント",
    "槍モニュメント": "ランサーモニュメント",
    "騎モニュメント": "ライダーモニュメント",
    "術モニュメント": "キャスターモニュメント",
    "殺モニュメント": "アサシンモニュメント",
    "狂モニュメント": "バーサーカーモニュメント",
}

const itemName2Id = Object.keys(itemNames).reduce((acc, id) => {
    acc[itemNames[id]] = id
    return acc
}, {})

Object.entries(itemAliasNames).forEach(([alias, itemName]) => {
    itemName2Id[alias] = itemName2Id[itemName]
})

const className2Id = {
    "剣": 0,
    "弓": 1,
    "槍": 2,
    "騎": 3,
    "術": 4,
    "殺": 5,
    "狂": 6,
    "裁": 7,
    "讐": 8,
    "分": 9,
    "月": 10,
    "降": 11,
    "詐": 12,
    "盾": 20,
}

const genderName2Id = {
    "男": 0,
    "女": 1,
    "-": 2
}

const power2Id = {
    "天": 0,
    "地": 1,
    "人": 2,
    "星": 3,
    "獣": 4
}

module.exports = {
    itemNames,
    itemName2Id,
    className2Id,
    genderName2Id,
    power2Id,
}