//
// convert atlas academy servant(JP) json to json
//
// expected data from
//   https://api.atlasacademy.io/export/JP/nice_servant.json
//

fs = require('fs')
pako = require('pako')



const className2Id = {
    "saber": 0,
    "archer": 1,
    "lancer": 2,
    "rider": 3,
    "caster": 4,
    "assassin": 5,
    "berserker": 6,
    "ruler": 7,
    "avenger": 8,
    "alterEgo": 9,
    "moonCancer": 10,
    "foreigner": 11,
    "pretender": 12,
    "shielder": 20,
}

const genderNames = {
    "male": "男",
    "female": "女",
    "unknown": "-"
}

const attribute2Id = {
    "sky": 0,
    "earth": 1,
    "human": 2,
    "star": 3,
    "beast": 4,
}

const traitnames =
{
    "alignmentBalanced": "中庸",
    "alignmentChaotic": "混沌",
    "alignmentEvil": "悪",
    "alignmentGood": "善",
    "alignmentLawful": "秩序",
    "alignmentMadness": "狂",
    "alignmentNeutral": "中立",
    "alignmentSummer": "夏",
    "arthur": "アーサー",
    "associatedToTheArgo": "アルゴノーツ",
    "atalante": "",
    "attributeBeast": "",
    "attributeEarth": "",
    "attributeHuman": "",
    "attributeSky": "",
    "attributeStar": "",
    "basedOnServant": "",
    "brynhildsBeloved": "愛する者",
    "canBeInBattle": "",
    "childServant": "子供",
    "classAlterEgo": "",
    "classArcher": "",
    "classAssassin": "",
    "classAvenger": "",
    "classBeastI": "",
    "classBeastII": "",
    "classBeastIIIL": "",
    "classBeastIIIR": "",
    "classBerserker": "",
    "classCaster": "",
    "classForeigner": "",
    "classGrandCaster": "",
    "classLancer": "",
    "classMoonCancer": "",
    "classPretender": "",
    "classRider": "",
    "classRuler": "",
    "classSaber": "",
    "classShielder": "",
    "demonBeast": "",
    "demonic": "魔性",
    "demonicBeastServant": "",
    "divine": "神性",
    "divineOrDemonOrUndead": "",
    "divineSpirit": "神霊",
    "dragon": "竜",
    "dragonSlayer": "",
    "existenceOutsideTheDomain": "領域外の生命",
    "fae": "妖精",
    "fairyTaleServant": "童話",
    "feminineLookingServant": "",
    "genderCaenisServant": "",
    "genderFemale": "",
    "genderMale": "",
    "genderUnknown": "性別不明",
    "genji": "源氏",
    "giant": "巨人",
    "greekMythologyMales": "ギリシャ男",
    "hasCostume": "",
    "hominidaeServant": "",
    "humanoid": "",
    "illya": "イリヤ",
    "king": "王",
    "knightsOfTheRound": "円卓",
    "livingHuman": "今を生きる人類",
    "mechanical": "機械",
    "nobunaga": "信長",
    "oni": "鬼",
    "riding": "騎乗スキル",
    "roman": "ローマ",
    "saberClassServant": "",
    "saberface": "アルトリア顔",
    "shuten": "",
    "skyOrEarth": "",
    "skyOrEarthExceptPseudoAndDemi": "",
    "superGiant": "超巨大",
    "threatToHumanity": "人類の脅威",
    "unknown": "",
    "weakToEnumaElish": "エヌマ特攻有効",
    "wildbeast": "猛獣",
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

const itemId = Object.keys(itemNames).reduce((acc, id) => {
    acc[itemNames[id]] = id
    return acc
}, {})

const unknownTraits = {}

const traits2string = (traits) => {
    const traitsString = traits.reduce((acc, trait) => {
        const traitName = traitnames[trait.name]
        if (traitName != null) {
            if (traitName) {
                acc += ` ${traitName}`
            }
        } else {
            unknownTraits[trait.name] = ""
        }
        return acc
    }, "").trim()

    if (traitsString.match(" エヌマ特攻有効")) {
        return traitsString.replace(" エヌマ特攻有効", "")
    } else {
        return `${traitsString} エヌマ特攻無効`
    }
}

const materials = ((materials) => {
    return Object.keys(materials).sort((a, b) => a - b).map((level) => {
        const items = materials[level].items.reduce((acc, item) => {
            const id = itemId[item.item.name]
            if (id) {
                acc[id] = item.amount
            }
            return acc
        }, {})
        items[itemId["QP"]] = materials[level].qp / 10000
        return items
    })
})

const cardType = {
    "buster": "B",
    "arts": "A",
    "quick": "Q"
}

const npTargetType = ((functions) => {
    const targetTypes = functions.reduce((acc, func) => {
        if (func.funcType.match("damage")) {
            if (func.funcTargetType == "enemyAll") {
                acc.push("全体")
            } else {
                acc.push("単体")
            }
        }
        return acc
    }, [])

    if (targetTypes.includes("全体")) {
        return "全体"
    }
    if (targetTypes.includes("単体")) {
        return "単体"
    }

    return "補助"
})

const checkNPTypes = ((noblePhantasms) => {
    return noblePhantasms.reduce((acc, np) => {
        const type = `${cardType[np.card]} ${npTargetType(np.functions)}`

        if (acc.findIndex((v) => v.match(npTargetType(np.functions))) < 0) {
            acc.push(type)
        }
        return acc
    }, [])
})

const parseNps = ((noblePhantasms) => {
    const names = {}
    return noblePhantasms.reduce((acc, np) => {
        const type = `${cardType[np.card]} ${npTargetType(np.functions)}`

        if (acc.findIndex((v) => v.match(npTargetType(np.functions))) < 0) {
            acc.push(type)
        }
        names[type] = `${np.name} ${np.rank}`
        return acc
    }, []).map((type) => names[type])
})

const parseSkills = ((skills) => {
    return skills.reduce((acc, skill) => {
        acc[skill.num - 1] = skill.name
        return acc
    }, ["", "", ""])
})

const parsePassiveSkills = ((skills) => {
    return skills.map((skill) => {
        return skill.name
    })
})

const parseAppendSkills = ((skills) => {
    return skills.map((skill) => {
        return skill.skill.name
    })
})

const atlasjson = JSON.parse(fs.readFileSync(process.argv[2]))

const servantList = {}
const servantNames = {}
const skills = {}
atlasjson.forEach((servantData) => {
    const id = servantData.collectionNo
    const classId = className2Id[servantData.className]
    const rare = servantData.rarity
    const gender = genderNames[servantData.gender]
    const attributes = attribute2Id[servantData.attribute]
    const traitsString = traits2string(servantData.traits)
    const hp = {
        min: servantData.hpBase,
        max: servantData.hpMax,
    }
    const attack = {
        min: servantData.atkBase,
        max: servantData.atkMax,
    }
    const npTypes = checkNPTypes(servantData.noblePhantasms)
    const skills = {
        np: parseNps(servantData.noblePhantasms),
        active: parseSkills(servantData.skills),
        passive: parsePassiveSkills(servantData.classPassive),
        append: parseAppendSkills(servantData.appendPassive),
    }
    const items = {
        "ascension": materials(servantData.ascensionMaterials),
        "skill": materials(servantData.skillMaterials),
        "appendSkill": materials(servantData.appendSkillMaterials)
    }

    if (!(servantData.type != "normal" && servantData.type != "heroine")) {
        servantNames[id] = servantData.name
        servantList[id] = {
            id, class: classId, rare, gender, attributes, characteristics: traitsString, hp, attack,
            npTypes, skills,
            items
        }
    }
})

try {
    fs.writeFileSync("servantdata.new.json", JSON.stringify(servantList))
    //    fs.writeFileSync("servantdata.json.gz",  pako.deflate(JSON.stringify(servantList)))
    //    fs.writeFileSync("servantid2msid.json", JSON.stringify(servantId2msId))
    fs.writeFileSync("servantnames.new.json", JSON.stringify(servantNames))
    fs.writeFileSync("skills.new.json", JSON.stringify(skills))
    //    fs.writeFileSync("skills.json.gz", pako.deflate(JSON.stringify(skills)))
} catch (e) {
    console.log(e)
}

console.log(JSON.stringify(unknownTraits))