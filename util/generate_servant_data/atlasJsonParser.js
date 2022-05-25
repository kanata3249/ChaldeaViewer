

const classNames = {
    "saber": "剣",
    "archer": "弓",
    "lancer": "槍",
    "rider": "騎",
    "caster": "術",
    "assassin": "殺",
    "berserker": "狂",
    "ruler": "裁",
    "avenger": "讐",
    "alterEgo": "分",
    "moonCancer": "月",
    "foreigner": "降",
    "pretender": "詐",
    "shielder": "盾",
}

const genderNames = {
    "male": "男",
    "female": "女",
    "unknown": "-"
}

const attributeNames = {
    "sky": "天",
    "earth": "地",
    "human": "人",
    "star": "星",
    "beast": "獣",
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
    "100600": "花嫁",
    "arthur": "アーサー",
    "associatedToTheArgo": "アルゴノーツ",
    "atalante": "",
    "attributeBeast": "",
    "attributeEarth": "",
    "attributeHuman": "",
    "attributeSky": "",
    "attributeStar": "",
    "basedOnServant": "サーヴァント",
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
    "feminineLookingServant": "性別不明",
    "genderCaenisServant": "",
    "genderFemale": "女性",
    "genderMale": "男性",
    "genderUnknown": "性別不明",
    "genji": "源氏",
    "giant": "巨人",
    "greekMythologyMales": "ギリシャ男",
    "hasCostume": "",
    "hominidaeServant": "",
    "humanoid": "人型",
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

const individualTargetName = {
    "1": "〔男性〕",
    "2": "〔女性〕",
    "109": "〔アルターエゴ〕",
    "115": "〔ムーンキャンサー〕",
    "200": "〔天〕",
    "201": "〔地〕",
    "202": "〔人〕",
    "300": "〔秩序〕",
    "304": "〔悪〕",
    "1132": "〔鬼〕",
    "1172": "〔人類の脅威〕",
    "2000": "〔神性〕",
    "2002": "〔竜〕",
    "2007": "〔アルトリア顔〕",
    "2008": "〔エヌマ・エリシュ〕",
    "2009": "〔騎乗スキル〕",
    "2010": "〔アーサー〕",
    "2011": "〔天または地の力を持つサーヴァント〕",
    "2012": "〔愛する者〕",
    "2019": "〔魔性〕",
    "2075": "〔セイバークラスのサーヴァント〕",
    "2076": "〔超巨大〕",
    "2113": "〔王〕",
    "2467": "〔急所判明〕 ",
    "2666": "〔巨人〕",
    "3011": "〔毒〕",
    "3012": "〔魅了〕",
    "3015": "〔やけど〕",
    "3021": "〔回避〕",
    "3025": "〔スキル封印〕",
}

const targetTextTable = {
    "playerAndEnemy": {
        "self": "自身",
        "ptAll": "味方全体",
        "ptOne": "味方単体",
        "ptOther": "自身を除く味方全体",
        "enemy": "敵単体",
        "enemyAll": "敵全体"
    },
    "player": {
        "self": "自身",
        "ptAll": "味方全体",
        "ptOne": "味方単体",
        "ptOther": "自身を除く味方全体",
        "enemy": "敵単体",
        "enemyAll": "敵全体",
        "commandTypeSelfTreasureDevice": "自身",
    },
    "enemy": {
        "self": "",
        "ptAll": "",
        "ptOne": "",
        "player": "",
        "enemy": "敵単体",
        "enemyAll": "敵全体"
    }
}

const effectNames = {
    'Busterアップ': 'Busterカード性能アップ',
    'Artsアップ': 'Artsカード性能アップ',
    'Quickアップ': 'Quickカード性能アップ',
    'Extra Attackアップ': 'Extraカード性能アップ',
    'スター発生アップ': 'スター発生率アップ',
    'クリティカル発生アップ': 'クリティカル発生率アップ',
    'スター発生ダウン': 'スター発生率ダウン',
    'クリティカル発生ダウン': 'クリティカル発生率ダウン',
    'スター集中アップ': 'スター集中度アップ',
    'スター集中アップ:Buster': 'Busterカードのスター集中度アップ',
    'スター集中アップ:Arts': 'Artsカードのスター集中度アップ',
    'スター集中アップ:Quick': 'Quickカードのスター集中度アップ',
    'ダメージカット': '被ダメージカット',
    'ダメージプラス': '与ダメージプラス',
    'ヒット数アップ': '攻撃回数',
    '即死': '即死効果',
    '強化付与アップ': '強化付与成功率アップ',
    '弱体付与アップ': '弱体付与成功率アップ',
    '精神異常付与アップ': '精神異常付与成功率アップ',
    'NP獲得アップ': 'NP獲得量アップ',
    '毒': '毒（毎ターンHP）減少',
    '呪い': '呪い（毎ターンHP）減少',
    'やけど': 'やけど（毎ターンHP）減少',
    'やけど(自己・非重複)': 'やけど（毎ターンHP）減少',
    '延焼': 'やけどの効果量アップ',
    'やけど無効': 'やけど無効状態',
    '魅了': '魅了（行動不能）',
    '石化': '石化（行動不能）',
    '拘束': '拘束（行動不能）',
    'スタン': 'スタン（行動不能）',
    '恐怖': '毎ターン終了時 恐怖（行動不能）',
    '特性付与〔竜〕': '〔竜〕特性追加',
    '最大HPプラス': '最大HP増加',
    '防御無視': '防御無視状態',
    'HP回復量アップ': 'HP回復効果量アップ',
    'スキルターン減少': 'スキルチャージ短縮',

    'NiceShot!': '防御力ダウン',

    '攻撃力アップ〔対セイバー〕': '対セイバー攻撃力アップ',
    '攻撃力アップ〔対アーチャー〕': '対アーチャー攻撃力アップ',
    '攻撃力アップ〔対ランサー〕': '対ランサー攻撃力アップ',
    '攻撃力アップ〔対ライダー〕': '対ライダー攻撃力アップ',
    '攻撃力アップ〔対キャスター〕': '対キャスター攻撃力アップ',
    '攻撃力アップ〔対アサシン〕': '対アサシン攻撃力アップ',
    '攻撃力アップ〔対バーサーカー〕': '対バーサーカー攻撃力アップ',
    '攻撃力アップ〔対ルーラー〕': '対ルーラー攻撃力アップ',
    '攻撃力アップ〔対アヴェンジャー〕': '対アヴェンジャー攻撃力アップ',
    '攻撃力アップ〔対アルターエゴ〕': '対アルターエゴ攻撃力アップ',
    '攻撃力アップ〔対フォーリナー〕': '対フォーリナー攻撃力アップ',
    '攻撃力アップ〔対ムーンキャンサー〕': '対ムーンキャンサー攻撃力アップ',
    '攻撃力アップ〔対プリテンダー〕': '対プリテンダー攻撃力アップ',
    '攻撃力アップ〔対エクストラクラス〕': '対エクストラクラス攻撃力アップ',

    '被クリティカル発生耐性アップ〔対セイバー〕': 'セイバーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対アーチャー〕': 'アーチャーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対ランサー〕': 'ランサーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対ライダー〕': 'ライダーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対キャスター〕': 'キャスターからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対アサシン〕': 'アサシンからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対バーサーカー〕': 'バーサーカーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対ルーラー〕': 'ルーラーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対アヴェンジャー〕': 'アヴェンジャーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対アルターエゴ〕': 'アルターエゴからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対フォーリナー〕': 'フォーリナーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対ムーンキャンサー〕': 'ムーンキャンサーからのクリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対プリテンダー〕': 'プリテンダからのークリティカル発生耐性アップ',
    '被クリティカル発生耐性アップ〔対エクストラクラス〕': 'エクストラクラスからのクリティカル発生耐性アップ',

    'タゲ集中アップ': 'ターゲット集中',
}

const appendSkillNames = {
    '対ｾｲﾊﾞｰｸﾘﾃｨｶﾙ発生耐性': '対セイバークリティカル発生耐性',
    '対ﾗﾝｻｰｸﾘﾃｨｶﾙ発生耐性': '対ランサークリティカル発生耐性',
    '対ｱｰﾁｬｰｸﾘﾃｨｶﾙ発生耐性': '対アーチャークリティカル発生耐性',
    '対ﾗｲﾀﾞｰｸﾘﾃｨｶﾙ発生耐性': '対ライダークリティカル発生耐性',
    '対ｷｬｽﾀｰｸﾘﾃｨｶﾙ発生耐性': '対キャスタークリティカル発生耐性',
    '対ｱｻｼﾝｸﾘﾃｨｶﾙ発生耐性': '対アサシンクリティカル発生耐性',
    '対ﾊﾞｰｻｰｶｰｸﾘﾃｨｶﾙ発生耐性': '対バーサーカークリティカル発生耐性',
    '対ﾙｰﾗｰｸﾘﾃｨｶﾙ発生耐性': '対ルーラークリティカル発生耐性',
    '対ｱｳﾞｪﾝｼﾞｬｰｸﾘﾃｨｶﾙ発生耐性': '対アヴェンジャークリティカル発生耐性',
    '対ｱﾙﾀｰｴｺﾞｸﾘﾃｨｶﾙ発生耐性': '対アルターエゴクリティカル発生耐性',
    '対ﾌｫｰﾘﾅｰｸﾘﾃｨｶﾙ発生耐性': '対フォーリナークリティカル発生耐性',
    '対ﾑｰﾝｷｬﾝｻｰｸﾘﾃｨｶﾙ発生耐性': '対ムーンキャンサークリティカル発生耐性',
    '対ﾌﾟﾘﾃﾝﾀﾞｰｸﾘﾃｨｶﾙ発生耐性': '対プリテンダークリティカル発生耐性',
    '対ｴｸｽﾄﾗｸﾗｽｸﾘﾃｨｶﾙ発生耐性': '対エクストラクラスクリティカル発生耐性',
}

const fieldNames = {
    "fieldShore": "〔水辺〕",
    "fieldCity": "〔都市〕",
    "fieldSunlight": "〔陽射し〕",
//    fieldIndividuality
    "fieldForest": "〔森林〕",
    "fieldImaginarySpace": "〔虚数空間〕",
    "fieldShoreOrImaginarySpace": "〔水辺〕または〔虚数空間〕",
    "fieldBurning": "〔炎上〕",
}

const stateNames = {
    "buffNegativeEffect": "〔弱体〕",
    "buffIncreaseDefence": "〔防御強化〕",
    "buffPositiveEffect": "〔強化〕",
    "buffEvadeAndInvincible": "〔無敵〕",
    "buffSureHit": "〔必中〕",
    "buffIncreaseDamage": "〔攻撃強化〕",
    "buffMentalEffect": "〔精神異常〕",
    "buffPoison": "〔毒〕",
    "buffBurn": "〔炎上〕",
    "buffEvade": "〔回避〕",
    "buffGuts": "〔ガッツ〕",
    "buffCurse": "〔呪い〕",

}

const unknownTraits = {}

const traits2string = (traits) => {
    const traitsString = traits.reduce((acc, trait) => {
        const traitName = traitnames[trait.name]
        if (traitName != null) {
            if (traitName && !acc.match(traitName)) {
                acc += ` ${traitName}`
            }
        } else {
            unknownTraits[trait.name] = ""
        }
        return acc
    }, "").trim()

    return traitsString
}

const traits2characteristics = (traits) => {
    const traitsString = traits.reduce((acc, trait) => {
        const traitName = traitnames[trait.id] || traitnames[trait.name]
        if (traitName != null) {
            if (traitName && !acc.match(traitName)) {
                acc += ` ${traitName}`
            }
        } else {
            unknownTraits[trait.name] = ""
        }
        return acc
    }, "").trim()

    const traitsString2 = traitsString.replace(/(男性|女性|人型|サーヴァント) ?/g, "").trim()
    const traitsString3 = traitsString2.match(/エヌマ特攻有効/) ? traitsString2.replace(/ ?エヌマ特攻有効/, "") : `${traitsString2} エヌマ特攻無効`

    return traitsString3.trim()
}

const materials = ((materials) => {
    return Object.keys(materials).sort((a, b) => a - b).map((level) => {
        const items = materials[level].items.reduce((acc, item) => {
            if (item.item.name) {
                acc[item.item.name] = item.amount
            }
            return acc
        }, {})
        items["QP"] = materials[level].qp / 10000
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

const individualTargetText = (target) => {
    if (target) {
        if (individualTargetName[target]) {
            return individualTargetName[target]
        } else {
            console.log("unknown individual target", target)
        }
    }
    return ""
}

const individualSumTargetText = (targetList) => {
    return targetList.map((target) => {
        if (individualTargetName[target]) {
            return individualTargetName[target]
        } else {
            console.log("unknown individual target", target)
            return `〔${target}〕`
        }
    }).join("または")
}

const targetText = (team, type, tvals) => {
    const targetTraits = tvals ? traits2string(tvals) : null
    if (targetTextTable[team] && targetTextTable[team][type]) {
      return targetTextTable[team][type] + (targetTraits ? `〔${targetTraits.split(/ /).join("〕＆〔")}〕` : "")
    }
    return ""
}

const parseGrowthType = (values) => {
    if (values[4]) {
        if (JSON.stringify(values[0]) == JSON.stringify(values[4])) {
            if (JSON.stringify(values[0][0]) == JSON.stringify(values[0][1])) {
                return ""
            } else {
                return "Lv"
            }
        } else {
            if (JSON.stringify(values[0][0]) == JSON.stringify(values[0][1])) {
                return "OC"
            } else {
                return "LvOC"
            }
        }
    } else {
        if (JSON.stringify(values[0][0]) == JSON.stringify(values[0][1])) {
            return ""
        } else {
            return "Lv"
        }
    }
}

const formatEffectValue = (value, rate, ratioHPLow, useRate, modifier, prefix, suffix) => {
    let rateStr = null
    let valueStr = null

    if (typeof value !== "undefined") {
        if (parseInt(value) % modifier) {
            valueStr = `${prefix}${(parseInt(value) / modifier).toFixed(2)}${suffix}`
        } else {
            valueStr = `${prefix}${parseInt(value) / modifier}${suffix}`
        }    
        if (typeof ratioHPLow !== "undefined") {
            if ((parseInt(value) + parseInt(ratioHPLow)) % modifier) {
                valueStr += `～${prefix}${(parseInt(value) + parseInt(ratioHPLow) / modifier).toFixed(2)}${suffix}`
            } else {
                valueStr += `～${prefix}${(parseInt(value) + parseInt(ratioHPLow)) / modifier}${suffix}`
            }    
        }
    }
    if (typeof rate !== "undefined") {
        rateStr = `rate:${parseInt(rate) / 10}%`
    }
    if (typeof useRate !== "undefined") {
        rateStr = `proc:${parseInt(useRate) / 10}%`
    }

    if (valueStr) {
        if (rateStr) {
            return `${valueStr}(${rateStr})`
        }
        return valueStr
    } else {
        if (rateStr) {
            return rateStr
        }
        return ""
    }
}

const parseEffectValues = (growthType, modifier, prefix, suffix, values) => {
    if (values[1]) {
        switch(growthType) {
        case "":
        case "Lv":
            return values[0].map((value) => {
                if (values[0][0].Rate != values[0][1].Rate) {
                    return formatEffectValue(value.Value, value.Rate, value.RatioHPLow, undefined, modifier, prefix, suffix)
                }
                if (values[0][0].UseRate != values[0][1].UseRate) {
                    return formatEffectValue(value.Value, undefined, value.RatioHPLow, value.UseRate, modifier, prefix, suffix)
                }
                return formatEffectValue(value.Value, undefined, value.RatioHPLow, undefined, modifier, prefix, suffix)
            })
        case "OC":
            return values.map((value) => {
                if (values[0][0].Rate != values[1][0].Rate) {
                    return formatEffectValue(value[0].Value, value[0].Rate, value[0].RatioHPLow, undefined, modifier, prefix, suffix)
                }
                return formatEffectValue(value[0].Value, undefined, value[0].RatioHPLow, undefined, modifier, prefix, suffix)
            })
        case "LvOC":
            if (values[0][0].Correction) {
                return [
                    `${parseInt(values[0][0].Value) / 10}%(特攻:${parseInt(values[0][0].Correction) / 10}%)`,
                    `${parseInt(values[0][1].Value) / 10}%(特攻:${parseInt(values[1][0].Correction) / 10}%)`,
                    `${parseInt(values[0][2].Value) / 10}%(特攻:${parseInt(values[2][0].Correction) / 10}%)`,
                    `${parseInt(values[0][3].Value) / 10}%(特攻:${parseInt(values[3][0].Correction) / 10}%)`,
                    `${parseInt(values[0][4].Value) / 10}%(特攻:${parseInt(values[4][0].Correction) / 10}%)`,
                ]
            } else if (values[0][0].Target) {
                return [
                    `${parseInt(values[0][0].Value) / 10}%(追加:${parseInt(values[0][0].Target) / 10}%)`,
                    `${parseInt(values[0][1].Value) / 10}%(追加:${parseInt(values[1][0].Target) / 10}%)`,
                    `${parseInt(values[0][2].Value) / 10}%(追加:${parseInt(values[2][0].Target) / 10}%)`,
                    `${parseInt(values[0][3].Value) / 10}%(追加:${parseInt(values[3][0].Target) / 10}%)`,
                    `${parseInt(values[0][4].Value) / 10}%(追加:${parseInt(values[4][0].Target) / 10}%)`,
                ]
            } {
                return [
                    `${prefix}${parseInt(values[0][0].Value) / 10}%(rate:${parseInt(values[0][0].Rate) / 10}%)`,
                    `${prefix}${parseInt(values[1][0].Value) / 10}%(rate:${parseInt(values[0][1].Rate) / 10}%)`,
                    `${prefix}${parseInt(values[2][0].Value) / 10}%(rate:${parseInt(values[0][2].Rate) / 10}%)`,
                    `${prefix}${parseInt(values[3][0].Value) / 10}%(rate:${parseInt(values[0][3].Rate) / 10}%)`,
                    `${prefix}${parseInt(values[4][0].Value) / 10}%(rate:${parseInt(values[0][4].Rate) / 10}%)`,
                ]
            }
        }
    } else {
        return values[0].map((value) => {
            if (values[0][0].Rate != values[0][1].Rate) {
                return formatEffectValue(value.Value, value.Rate, value.RatioHPLow, undefined, modifier, prefix, suffix)
            }
            if (values[0][0].UseRate != values[0][1].UseRate) {
                return formatEffectValue(value.Value, undefined, value.RatioHPLow, value.UseRate, modifier, prefix, suffix)
            }
            if (values[0][1].Value) {
                return formatEffectValue(value.Value, undefined, value.RatioHPLow, undefined, modifier, prefix, suffix)
            }
            return ""
        })
    }
}

const parseDamageNpIndividualEffectValues = (growthType, modifier, prefix, suffix, values) => {
    if (values[1]) {
        switch(growthType) {
        case "":
        case "Lv":
            return values[0].map((value) => {
                if (typeof value.Value === "undefined") {
                    return ""
                } else {
                    return `${prefix}${parseInt(value.Value) / modifier}${suffix}(特攻:${parseInt(value.Correction) / 10}%)`
                }
            })
        case "OC":
            return values.map((value) => {
                if (typeof value[0].Value === "undefined") {
                    return ""
                } else {
                    return `${prefix}${parseInt(value[0].Value) / modifier}${suffix}`
                }
            })
        case "LvOC":
            return [
                `${parseInt(values[0][0].Value) / 10}%(特攻:${parseInt(values[0][0].Correction) / 10}%)`,
                `${parseInt(values[0][1].Value) / 10}%(特攻:${parseInt(values[1][0].Correction) / 10}%)`,
                `${parseInt(values[0][2].Value) / 10}%(特攻:${parseInt(values[2][0].Correction) / 10}%)`,
                `${parseInt(values[0][3].Value) / 10}%(特攻:${parseInt(values[3][0].Correction) / 10}%)`,
                `${parseInt(values[0][4].Value) / 10}%(特攻:${parseInt(values[4][0].Correction) / 10}%)`,
            ]
        }
    } else {
        return values[0].map((value) => {
            if (value.Value) {
                if (parseInt(value.Value) % modifier) {
                    return `${prefix}${(parseInt(value.Value) / modifier).toFixed(2)}${suffix}`
                } else {
                    return `${prefix}${parseInt(value.Value) / modifier}${suffix}`
                }
            } else {
                return ""
            }
        })
    }
}

const prefixByEffectName = (effectName) => {
    if (effectName.match(/(ダウン|減少|カット|短縮)/)) {
        return "-"
    }
    if (effectName.match(/(ガッツ)/)) {
        return "HP"
    }
    return ""
}

const suffixByEffectName = (effectName) => {
    if (effectName.match(/(ダメージカット|タイプチェンジ|ガッツ|ダメージプラス|毎ターンHP|最大HP)/)) {
        return ""
    }
    if (effectName.match(/(攻撃回数)/)) {
        return "倍"
    }
    if (effectName.match(/(スター獲得)/)) {
        return "個"
    }
    return "%"
}

const dividerByEffectName = (effectName) => {
    if (effectName.match(/(攻撃回数|ダメージカット|タイプチェンジ|ガッツ|ダメージプラス|毎ターンHP|毎ターンスター|最大HP)/)) {
        return 1
    }
    if (effectName.match(/(毎ターンNP)/)) {
        return 100
    }
    return 10
}

const parseTraitStateVals =  ((func) => {
    const states = func.traitVals.reduce((acc, state) => {
        if (stateNames[state.name]) {
            acc.push(stateNames[state.name])
        } else {
            console.log("unknown traitVals", state)
        }
        return acc
    }, [])

    if (states.length) {
        return states.join()
    }

    return ""
})

const parseQuestTvals = ((func) => {
    const fields = func.funcquestTvals.reduce((acc, field) => {

        if (fieldNames[field.name]) {

            acc.push(fieldNames[field.name])
        } else {
            console.log("unknown field", field)
        }
        return acc
    }, [])

    if (fields.length) {
        return fields.join("または") + "のフィールドの時 "
    }

    return ""
})

const parseEffectRate = (func) => {
    if (func.svals2 && func.svals2[0].Rate != func.svals[0].Rate) {
        return 'rate:OC変動'
    }
    if (func.svals[0].Rate != func.svals[1].Rate) {
        return 'rate:LV変動'
    }
    if (func.svals[0].Rate < 1000) {
        return `rate:${Math.abs(func.svals[0].Rate) / 10}%`
    }

    return ''
}

const parseEffectProc = (func) => {
    if (func.svals2 && func.svals2[0].UseRate != func.svals[0].UseRate) {
        return 'proc:OC変動'
    }
    if (func.svals[0].UseRate != func.svals[1].UseRate) {
        return 'proc:LV変動'
    }
    if (func.svals[0].UseRate < 1000) {
        return `proc:${Math.abs(func.svals[0].UseRate) / 10}%`
    }

    return ''
}

const parseEffectName = (func) => {
    const name = func.buffs[0] ? (effectNames[func.buffs[0].name] || func.buffs[0].name) : (effectNames[func.funcPopupText] || func.funcPopupText)
    const modname = name.replace(/(.*)(〔.*〕)/, "$2$1")

    const field = parseQuestTvals(func)
    const cond = func.svals[0].RatioHPLow > 0 ? "HPが少ないほど" : ""
    const add = []
    if (func.svals[0].Turn > 0) {
        add.push(`${func.svals[0].Turn}T`)
    }
    if (func.svals[0].Count > 0) {
        add.push(`${func.svals[0].Count}回`)
    }
    const rate = parseEffectRate(func)
    if (rate.length) {
        add.push(rate)
    }
    const proc = parseEffectProc(func)
    if (proc.length) {
        add.push(proc)
    }
    const addStr = add.length ? `(${add.join("/")})` : ""
    return `${field}${cond}${modname}${addStr}`
}

const parseAddState = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, dividerByEffectName(effectName), prefixByEffectName(effectName), suffixByEffectName(effectName), [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])

    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseAddStateShort = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, dividerByEffectName(effectName), prefixByEffectName(effectName), suffixByEffectName(effectName), [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])

    if (effectName.match(/やけど無効/) && !func.funcPopupText.match(/やけど無効/)) {
        return null
    }
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseSubState = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseTraitStateVals(func) + "状態を解除"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, dividerByEffectName(effectName), prefixByEffectName(effectName), suffixByEffectName(effectName), [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])

    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseMoveState = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = func.funcPopupText
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, dividerByEffectName(effectName), prefixByEffectName(effectName), suffixByEffectName(effectName), [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])

    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseGainNp = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "NP増加"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 100, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseLossNp = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "NP減少"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 100, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseGainHp = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "HP回復"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseGainStar = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "スター獲得"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, '', "個", [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseLossHp = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "HP減少"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseLossHpSafe = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "HP減少"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseDamageNp = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "宝具攻撃"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 10, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseDamageNpPierce = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "防御力無視宝具攻撃"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 10, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseDamageNpIndividual = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals) + individualTargetText(func.svals[0].Target)
    const effectName = "特攻宝具攻撃"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseDamageNpIndividualEffectValues(growthType, 10, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseDamageNpIndividualSum = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals) + individualSumTargetText(func.svals[0].TargetList)
    const effectName = "特攻宝具攻撃"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseDamageNpIndividualEffectValues(growthType, 10, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseDamageNpStateIndividualFix = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals) + individualTargetText(func.svals[0].Target)
    const effectName = "状態特攻宝具攻撃"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 10, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseDamageNpHpratioLow = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "HP反比例宝具攻撃"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 10, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseHastenNpturn = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "チャージ増加"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseDelayNpturn = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseShortenSkill = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseInstantDeath = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseEffectName(func)

    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseNone = (func) => null

const functionParser = {
    "none": parseNone,
    "addStateShort": parseAddStateShort,
    "addState": parseAddState,
    "subState": parseSubState,
    "moveState": parseMoveState,
    "instantDeath": parseInstantDeath,
    "gainNp": parseGainNp,
    "lossNp": parseLossNp,
    "gainHp": parseGainHp,
    "lossHp": parseLossHp,
    "lossHpSafe": parseLossHpSafe,
    "gainStar": parseGainStar,
    "hastenNpturn": parseHastenNpturn,
    "delayNpturn": parseDelayNpturn,
    "shortenSkill": parseShortenSkill,
    "damageNp": parseDamageNp,
    "damageNpPierce": parseDamageNpPierce,
    "damageNpIndividual": parseDamageNpIndividual,
    "damageNpIndividualSum": parseDamageNpIndividualSum,
    "damageNpStateIndividualFix": parseDamageNpStateIndividualFix,
    "damageNpHpratioLow": parseDamageNpHpratioLow,
}

const parseFunction = (func) => {
    if (functionParser[func.funcType]) {
        return functionParser[func.funcType](func)
    } else {
        console.log("unknown funcType", func.funcType)
        return null
    }
}

const parseFunctions = (functions) => {
    return functions.reduce((acc, func) => {
        const effect = parseFunction(func)
        if (effect && effect.target) {
            if ((effect.target.match(/敵/) && effect.text.match(/スター/))
                || (effect.target.match(/敵/) && effect.text.match(/NP/))
                || (effect.target.match(/(味方|自身)/) && effect.text.match(/クリティカル発生率/))
                || (effect.target.match(/(味方|自身)/) && effect.text.match(/チャージ増加/))
            ) {
                // ignore this effect
            } else {
              acc.push(effect)
            }
        }
        return acc
    }, [])
}

const parseNpsSpec = ((noblePhantasms) => {
    return noblePhantasms.reduce((acc, np) => {
        const type = `${cardType[np.card]} ${npTargetType(np.functions)}`
        const skillSpec = {
            name: `${np.name} ${np.rank}`,
            type: "np",
            effects: parseFunctions(np.functions),
            npType: type,
        }

        const index = acc.findIndex((v) => v.npType.match(npTargetType(np.functions)))
        if (index < 0) {
            acc.push(skillSpec)
        } else {
            if (type == acc[index].npType) {
                acc[index] = skillSpec
        }
        }

        return acc
    }, [])
})

const parseSkillsSpec = ((skills) => {
    return skills.reduce((acc, skill) => {
        const skillSpec = {
            name: skill.name,
            type: "active",
            effects: parseFunctions(skill.functions),
            ct: skill.coolDown[0],
        }

        acc[skill.num - 1] = skillSpec
        return acc
    }, [{}, {}, {}])
})

const parsePassiveSkillsSpec = ((skills) => {
    return skills.reduce((acc, skill) => {
        const skillSpec = {
            name: skill.name,
            type: "passive",
            effects: parseFunctions(skill.functions)
        }
        skillSpec.effects = skillSpec.effects.map((effect) => {
            effect.values = [ effect.values[0] ]
            return effect
})

        acc.push(skillSpec)
        return acc
    }, [])
    })

const parseAppendSkillsSpec = ((skills) => {
    return skills.reduce((acc, skill) => {
        const skillSpec = {
            name: appendSkillNames[skill.skill.name] || skill.skill.name,
            type: "append",
            effects: parseFunctions(skill.skill.functions)
        }
        
        acc.push(skillSpec)
        return acc
    }, [])
})

const growthCurve2Str = (v) => {
    return [ "平均", "凹型", "凸型", "", "凹型弱", "凸型弱" ][(v - 1) / 5 >> 0]
}

const parseServantsJson = (json, servantId) => {
    const servants = {}
    
    json.forEach((servantData) => {
        const id = servantData.collectionNo
        if (servantId) {
            if (servantId != id) {
                return
            }
            try {
                fs.writeFileSync(`debug-${id}.json`, JSON.stringify([servantData], null, 4))
            } catch (e) {
            }
        } else {
            console.log("parsing ", id)
        }
        const classe = classNames[servantData.className]
        const rare = servantData.rarity
        const gender = genderNames[servantData.gender]
        const attributes = attributeNames[servantData.attribute]
        const characteristics = traits2characteristics(servantData.traits)
        const hp = {
            min: servantData.hpBase,
            max: servantData.hpMax,
        }
        const attack = {
            min: servantData.atkBase,
            max: servantData.atkMax,
        }
        const growthCurve = growthCurve2Str(servantData.growthCurve)
        const npTypes = checkNPTypes(servantData.noblePhantasms)
        const items = {
            "ascension": materials(servantData.ascensionMaterials),
            "skill": materials(servantData.skillMaterials),
            "appendSkill": materials(servantData.appendSkillMaterials)
        }
        if (items.ascension.length == 0) {
            items.ascension = [ {}, {}, {}, {} ]
        }

        const skills = {
            np: parseNpsSpec(servantData.noblePhantasms),
            active: parseSkillsSpec(servantData.skills),
            passive: parsePassiveSkillsSpec(servantData.classPassive),
            append: parseAppendSkillsSpec(servantData.appendPassive),
        }

        if (!(servantData.type != "normal" && servantData.type != "heroine")) {
            servants[id] = {
                id, class: classe, rare, name: servantData.name, gender, attributes, characteristics, hp, attack, growthCurve,
                npTypes, skills,
                items
            }
        }
    })
    return servants
}

const atlasJsonParser = {
    parseServantsJson,
}
module.exports = atlasJsonParser

