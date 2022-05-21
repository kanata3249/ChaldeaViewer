//
// convert atlas academy servant(JP) json to json
//
// expected data from
//   https://api.atlasacademy.io/export/JP/nice_servant.json
//

fs = require('fs')
pako = require('pako')
const { execSync } = require('child_process')

const atlasjson = JSON.parse(fs.readFileSync("output/servantdata.new.json"))
const atlasSkills = JSON.parse(fs.readFileSync("output/skills.new.json"))
Object.values(atlasSkills).forEach((skill) => delete skill.id)
const old = JSON.parse(fs.readFileSync("output/servantdata.json"))
const oldSkills = JSON.parse(fs.readFileSync("output/skills.json"))
Object.values(oldSkills).forEach((skill) => delete skill.id)
const servantnames = JSON.parse(fs.readFileSync("output/servantnames.new.json"))

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

const D_MUD = 'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴヷヺ';
const S_MUD = 'ｶﾞｷﾞｸﾞｹﾞｺﾞｻﾞｼﾞｽﾞｾﾞｿﾞﾀﾞﾁﾞﾂﾞﾃﾞﾄﾞﾊﾞﾋﾞﾌﾞﾍﾞﾎﾞﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟｳﾞﾜﾞｦﾞ';
//kiyone
const D_KIY = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ'
            +'マミムメモヤユヨラリルレロワヲンァィゥェォッャュョ。、ー「」・';
const S_KIY = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｯｬｭｮ｡､ｰ｢｣･';

const toZenKata = str => {
    for (let i=0,len=D_MUD.length; i<len; i++) {
        str = str.split( S_MUD.slice(i*2, i*2+2) ).join( D_MUD.slice(i, i+1) );
    }
    for (let i=0,len=D_KIY.length; i<len; i++) {
        str = str.split( S_KIY.slice(i, i+1) ).join( D_KIY.slice(i, i+1) );
    }
    return str;
}

const checkAndDelete = (a, b, key) => {
    if (toZenKata(JSON.stringify(a[key])) == toZenKata(JSON.stringify(b[key]))) {
        delete a[key]
        delete b[key]
    }
}

const diffAndDeleteSkill = (a, b, key) => {
    if (a[key].length != b[key].length) {
        console.log("length differ", a[key].length, b[key].length)
    } else {
        a[key].forEach((va, index) => {
            if (va.effects) {
                va.effects = va.effects.map((effect) => {
                    effect.values = effect.values.map((value) => {
                        return value.toString().replace(/(\.[0-9])0+%/, "$1%").replace(/^HP/, "")
                    })
                    return effect
                })
            }
            if (b[key][index].effects) {
                b[key][index].effects = b[key][index].effects.map((effect) => {
                    effect.values = effect.values.map((value) => {
                        return value.toString().replace(/(\.[0-9])0+\%/, "$1%").replace(/^HP/, "")
                    })
                    return effect
                })
            }
            if (JSON.stringify(va) != JSON.stringify(b[key][index])) {
                console.log(key, "differ[", index, "]")
                console.log(JSON.stringify(va, null, 2))
                console.log(JSON.stringify(b[key][index], null, 2))
            }
            delete va.effects
            delete b[key][index].effects
            if (JSON.stringify(va) != JSON.stringify(b[key][index])) {
                console.log(JSON.stringify(va, null, 2))
                console.log(JSON.stringify(b[key][index], null, 2))
            }
        })
    }
    delete a[key]
    delete b[key]
}

try {
    fs.mkdirSync('./tmp')
} catch(e) {

}
Object.values(atlasjson).forEach((atlas) => {
    const atwiki = old[atlas.id]
    if (!atwiki) {
        console.log(`servant id=${atlas.id} ${servantnames[atlas.id]} not found in old json.`)
    } else {
        atlas.characteristics = atlas.characteristics.split(' ').sort().join(' ').replace("騎乗スキル", "騎乗")
        atlas.skills.passive = atlas.skills.passive.sort((a, b) => atlasSkills[a].name.localeCompare(atlasSkills[b].name))
        atlas.skills.np = atlas.skills.np.map((id) => atlasSkills[id])
        atlas.skills.active = atlas.skills.active.map((id) => atlasSkills[id])
        atlas.skills.passive = atlas.skills.passive.map((id) => atlasSkills[id])
        atlas.skills.append = atlas.skills.append.map((id) => atlasSkills[id])
        atwiki.characteristics = atwiki.characteristics.split(' ').sort().join(' ').replace("騎乗スキル", "騎乗").trim()
        atwiki.skills.passive = atwiki.skills.passive.sort((a, b) => oldSkills[a].name.localeCompare(oldSkills[b].name))
        atwiki.skills.np = atwiki.skills.np.map((id) => oldSkills[id])
        atwiki.skills.active = atwiki.skills.active.map((id) => oldSkills[id])
        atwiki.skills.passive = atwiki.skills.passive.map((id) => oldSkills[id])
        atwiki.skills.append = atwiki.skills.append.map((id) => oldSkills[id])
        if (atlas.rare == 2 || atlas.rare == 0) {
            delete atlas.items
            delete atwiki.items
        }
        if (JSON.stringify(atlas) != JSON.stringify(atwiki)) {
            try {
                fs.writeFileSync(`tmp/${atlas.id}-a.json`, JSON.stringify(atlas, null, 2).replace(/(\.[1-9]+)0+%/g, "$1%"))
                fs.writeFileSync(`tmp/${atwiki.id}-w.json`, JSON.stringify(atwiki, null, 2).replace(/(\.[1-9]+)0+%/g, "$1%"))

                try {
                    const diffstr = execSync(`diff.exe -u tmp/${atlas.id}-a.json tmp/${atwiki.id}-w.json`)
                    console.log(diffstr.toString())
                } catch(e) {
                    console.log(e.stdout.toString())
                }
            } catch(e) {
            }

        }
    }
})
