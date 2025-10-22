const iteminfo = {}

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
    "beast": "獣",
    "beastEresh": "獣",
    "unBeast": "反",
    "atlasUnmappedClass":  "獣",
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

const { appendSkillNames } = require('./parser_data/appendSkillNames')
const { traitNames, targetTraitNames } = require('./parser_data/traitNames')
const { targetNames, individualTargetNames } = require('./parser_data/targetNames')
const { effectNames } = require('./parser_data/effectNames')
const { fieldNames } = require('./parser_data/fieldNames')
const { stateNames } = require('./parser_data/stateNames')
const { additionalEffects } = require('./parser_data/additionalEffects')

const unknownTraits = {}

const targettraits2string = (traits) => {
    const allnegative = traits.length > 0 && traits.every((trait) => trait.negative)
    const traitsString = traits.reduce((acc, trait) => {
        const traitName = targetTraitNames[trait.id] || targetTraitNames[trait.name]
        if (traitName != null) {
            if (traitName && !acc.match(traitName)) {
                if (!allnegative && acc.length > 0) {
                    acc += "または"
                }
                acc += traitName.startsWith('〔') ? traitName : `〔${traitName}〕`
                if (trait.negative && !allnegative) {
                    acc += "以外"
                }
            }
        } else {
            unknownTraits[trait.name] = ""
        }
        return acc
    }, "").trim()

    return `${traitsString}${allnegative ? "以外" : ""}`
}

const traits2characteristics = (traits, ascensionAdd) => {
    const traitsString = traits.reduce((acc, trait) => {
        const traitName = traitNames[trait.id] || traitNames[trait.name]
        if (traitName != null) {
            if (traitName && !acc.match(traitName)) {
                acc += ` ${traitName}`
            }
        } else {
            unknownTraits[trait.name] = ""
        }
        return acc
    }, "").trim()

    const additionalAscentionTraits = Object.entries(ascensionAdd).reduce((acc, [ascention, ascensionTraits]) => {
        ascensionTraits.reduce((acc2, ascentionTrait) => {
            if (traits.findIndex((trait) => trait.id == ascentionTrait.id) < 0) {
                const ascentions = acc2[ascentionTrait.id]?.ascentions || []
                acc2[ascentionTrait.id] = { id:ascentionTrait.id, name: ascentionTrait.name, ascentions: [ ...ascentions, ascention ] }
            }
            return acc2
        },acc)
        return acc
    },{})
    const additionalAscentionTraitsString = Object.values(additionalAscentionTraits).reduce((acc, ascentionTrait) => {
        const traitName = traitNames[ascentionTrait.id] || traitNames[ascentionTrait.name]
        if (traitName != null) {
            
            acc += ` ${traitName}@${ascentionTrait.ascentions[0]}`
            if (ascentionTrait.ascentions.length >= 2) {
                acc += `-${ascentionTrait.ascentions.slice(-1)[0]}`
            }
        }
        return acc
    },"")

    const traitsString2 = traitsString.replace(/(男性|女性|人型|サーヴァント) ?/g, "").trim() + additionalAscentionTraitsString
    const traitsString3 = traitsString2.match(/エヌマ特攻有効/) ? traitsString2.replace(/ ?エヌマ特攻有効/, "") : `${traitsString2} エヌマ特攻無効`

    return traitsString3.trim()
}

const materials = ((materials) => {
    return Object.keys(materials).sort((a, b) => a - b).map((level) => {
        const items = materials[level].items.reduce((acc, item) => {
            if (item.item.name) {
                acc[item.item.name] = item.amount

                iteminfo[item.item.id] = item.item.name
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
    "quick": "Q",
    "1": "A",
    "2": "B",
    "3": "Q"
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
    return noblePhantasms.map((np) => np.npType)
})

const individualTargetText = (target) => {
    if (target) {
        if (individualTargetNames[target]) {
            return `〔${individualTargetNames[target]}〕`
        } else {
            console.log("unknown individual target", target)
        }
    }
    return ""
}

const individualSumTargetText = (targetList) => {
    return targetList.map((target) => {
        if (individualTargetNames[target]) {
            return `〔${individualTargetNames[target]}〕`
        } else {
            console.log("unknown individual target", target)
            return `〔${target}〕`
        }
    }).join("または")
}

const overWriteTargetText = (targetList) => {
    return targetList?.map((targetTvals) => {
        return targetTvals.reduce((acc, target) => {
            if (individualTargetNames[target.id]) {
                acc.push(`〔${individualTargetNames[target.id]}〕`)
            }
            return acc
        },[]).join("の")
    }).join("または") || ""
}

const andCheckIndividuality = (tvals) => {
    const individuality = tvals.reduce((acc, id) => {
        if (individualTargetNames[id]) {
            acc.push(individualTargetNames[id])
        }
        return acc
    },[]).join('の')
    return `〔${individuality}〕`
}

const targetText = (team, type, tvals) => {
    const targetTraits = tvals ? targettraits2string(tvals) : ""
    if (targetNames[team] && targetNames[team][type]) {
      return targetNames[team][type] + targetTraits
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
        if (values[0].length == 1 || JSON.stringify(values[0][0]) == JSON.stringify(values[0][6])) {
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
                    return formatEffectValue(value.Value, value.Rate, value.RatioHPLow || value.Target, undefined, modifier, prefix, suffix)
                }
                if (values[0][0].UseRate != values[0][1].UseRate) {
                    return formatEffectValue(value.Value, undefined, value.RatioHPLow || value.Target, value.UseRate, modifier, prefix, suffix)
                }
                return formatEffectValue(value.Value, undefined, value.RatioHPLow || value.Target, undefined, modifier, prefix, suffix)
            })
        case "OC":
            return values.map((value) => {
                if (values[0][0].Rate != values[1][0].Rate) {
                    return formatEffectValue(value[0].Value, value[0].Rate, value[0].RatioHPLow || value.Target, undefined, modifier, prefix, suffix)
                }
                return formatEffectValue(value[0].Value, undefined, value[0].RatioHPLow || value.Target, undefined, modifier, prefix, suffix)
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
            if (values[0][6] && values[0][0].Count != values[0][6].Count) {
                return formatEffectValue(value.Count, undefined, undefined, undefined, modifier, prefix, suffix)
            }
            if (values[0][1] && values[0][0].Rate != values[0][1].Rate) {
                return formatEffectValue(value.Value, value.Rate, value.RatioHPLow || value.Target, undefined, modifier, prefix, suffix)
            }
            if (values[0][1] && values[0][0].UseRate != values[0][1].UseRate) {
                return formatEffectValue(value.Value, undefined, value.RatioHPLow || value.Target, value.UseRate, modifier, prefix, suffix)
            }
            if (values[0][1]?.Value) {
                return formatEffectValue(value.Value, undefined, value.RatioHPLow || value.Target, undefined, modifier, prefix, suffix)
            }
            return ""
        })
    }
}

const parseEffectStateValues = (growthType, modifier, prefix, suffix, values) => {
    if (values[1]) {
        switch(growthType) {
        case "":
        case "Lv":
            return values[0].map((value) => {
                if (values[0][0].Rate != values[0][1].Rate) {
                    return formatEffectValue(undefined, value.Rate, value.RatioHPLow, undefined, modifier, prefix, suffix)
                }
                if (values[0][0].UseRate != values[0][1].UseRate) {
                    return formatEffectValue(undefined, undefined, value.RatioHPLow, value.UseRate, modifier, prefix, suffix)
                }
                return formatEffectValue(undefined, undefined, value.RatioHPLow, undefined, modifier, prefix, suffix)
            })
        case "OC":
            return values.map((value) => {
                if (values[0][0].Rate != values[1][0].Rate) {
                    return formatEffectValue(undefined, value[0].Rate, value[0].RatioHPLow, undefined, modifier, prefix, suffix)
                }
                if (values[0][0].UseRate != values[1][0].UseRate) {
                    return formatEffectValue(undefined, undefined, value[0].RatioHPLow, value[0].UseRate, modifier, prefix, suffix)
                }
                return formatEffectValue(undefined, undefined, value[0].RatioHPLow, undefined, modifier, prefix, suffix)
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
                return formatEffectValue(undefined, value.Rate, value.RatioHPLow, undefined, modifier, prefix, suffix)
            }
            if (values[0][0].UseRate != values[0][1].UseRate) {
                return formatEffectValue(undefined, undefined, value.RatioHPLow, value.UseRate, modifier, prefix, suffix)
            }
            if (values[0][1].Value) {
                return formatEffectValue(undefined, undefined, value.RatioHPLow, undefined, modifier, prefix, suffix)
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

const parseDamageNpIndividualSumEffectValues = (growthType, modifier, prefix, suffix, values) => {
    if (values[1]) {
        switch(growthType) {
        case "":
        case "Lv":
            return values[0].map((value) => {
                if (typeof value.Value === "undefined") {
                    return ""
                } else {
                    return `${prefix}${parseInt(value.Value) / modifier}${suffix}(特攻:${parseInt(value.Correction) / 10}*N(最大${value.ParamAddMaxCount})%)`
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
                `${parseInt(values[0][0].Value) / 10}%(特攻:${parseInt(values[0][0].Correction) / 10}*N(最大${values[0][0].ParamAddMaxCount})%)`,
                `${parseInt(values[0][1].Value) / 10}%(特攻:${parseInt(values[1][0].Correction) / 10}*N(最大${values[1][0].ParamAddMaxCount})%)`,
                `${parseInt(values[0][2].Value) / 10}%(特攻:${parseInt(values[2][0].Correction) / 10}*N(最大${values[2][0].ParamAddMaxCount})%)`,
                `${parseInt(values[0][3].Value) / 10}%(特攻:${parseInt(values[3][0].Correction) / 10}*N(最大${values[3][0].ParamAddMaxCount})%)`,
                `${parseInt(values[0][4].Value) / 10}%(特攻:${parseInt(values[4][0].Correction) / 10}*N(最大${values[4][0].ParamAddMaxCount})%)`,
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
    if (effectName.match(/(オーバーチャージ)/)) {
        return "段階"
    }
    return "%"
}

const dividerByEffectName = (effectName) => {
    if (effectName.match(/(攻撃回数|ダメージカット|タイプチェンジ|ガッツ|ダメージプラス|毎ターンHP|毎ターンスター|最大HP|オーバーチャージ)/)) {
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
            if (stateNames[state.name] === undefined)
            console.log("unknown traitStateVals", state)
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
    if (func.svals[1] && func.svals[0].Rate != func.svals[1].Rate) {
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
    if (func.svals[1] && func.svals[0].UseRate != func.svals[1].UseRate) {
        return 'proc:LV変動'
    }
    if (func.svals[0].UseRate < 1000) {
        return `proc:${Math.abs(func.svals[0].UseRate) / 10}%`
    }

    return ''
}
const cardNames = {
    "cardBuster": "Busterカード"
}

const parseEffectNameCondition = (func) => {
    if (func.svals[0].TriggeredTargetHpRateRange) {
        const threshold = func.svals[0].TriggeredTargetHpRateRange.match(/\d+/)[0]
        return `HPが${threshold/10}%以下の時、`
    }
    return func.svals[0].RatioHPLow > 0 ? "HPが少ないほど" : ""
}

const parseEffectName = (func) => {
    const name = effectNames[func.funcPopupText] || func.funcPopupText
    const modname = name.replace(/(.*)(〔.*〕)/, "$2$1").replace(/(.*)・対\s*(.*)/, "〔$2〕$1").replace(/(〔.*〕)フィールドセット/,"フィールドセット$1")
    const field = parseQuestTvals(func)
    const cond = parseEffectNameCondition(func)
    const gutsBlockNegative = func.buffs[0]?.id == 3761
    const card = cardNames[func.buffs[0]?.ckSelfIndv[0]?.name] || ""
    const nocard = modname.startsWith(card)
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
    return `${field}${cond}${nocard ? "" : card + "の"}${modname}${gutsBlockNegative ? "(重複可能)" : ""}${addStr}`
}

const parseAddStateExternalBuffEffectNameX = (addStateShortXState) => {
    const add = []
    if (addStateShortXState.Turn > 0) {
        add.push(`${addStateShortXState.Turn}T`)
    }
    if (addStateShortXState.Count > 0) {
        add.push(`${addStateShortXState.Count}回`)
    }
    const target = addStateShortXState.Target?.length ? addStateShortXState.Target : ""
    const conjuction = target.length > 0 ? ( addStateShortXState.Text.endsWith('〕') ? 'に' : 'の') : ""
    const stateX = target + conjuction + addStateShortXState.Text + (add.length ? `(${add.join("/")})` : "")

    return stateX
}

const parseAddStateExternalBuffEffectName = (func, index) => {
    const targetTrait = func.buffs[0].ckOpIndv.length ? targettraits2string(func.buffs[0].ckOpIndv) + 'の敵' : ''
    const name = func.buffs[0] ? (effectNames[func.buffs[0].name.replace(/\(.*\)/,"")] || func.buffs[0].name) : (effectNames[func.funcPopupText.replace(/\(.*\)/,"")] || func.funcPopupText)
    const modname = name.replace(/\(.*\)/,"").replace(/(.*)(〔.*〕)/, "$2$1").replace(/追加効果/,"")
    const stateId = func.svals[0].Value
    const addStateShortXState = (typeof index !== "undefined" && additionalEffects[stateId][index]) || additionalEffects[stateId] || { Text: "", Turn: 0, Count: 0 }
    const stateX = parseAddStateExternalBuffEffectNameX(addStateShortXState)

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
    return `${field}${cond}${targetTrait}${modname}${addStr} ${stateX}`.trim()
}

const parseAddStateShortCommandAttackEffectName = (func, index) => {
    return parseAddStateExternalBuffEffectName(func, index)
}

const parseAddStateShortSelfTurnendEffectName = (func) => {
    const name = func.buffs[0] ? (effectNames[func.buffs[0].name.replace(/\(.*\)/,"")] || func.buffs[0].name) : (effectNames[func.funcPopupText.replace(/\(.*\)/,"")] || func.funcPopupText)
    const modname = name.replace(/\(.*\)/,"").replace(/(.*)(〔.*〕)/, "$2$1").replace(/追加効果/,"")
    const stateId = func.svals[0].Value
    const addStateShortXState = additionalEffects[stateId] || { Text: "", Turn: 0, Count: 0 }
    const stateX = parseAddStateExternalBuffEffectNameX(addStateShortXState)

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
    return `${field}${cond}${modname}${addStr} ${stateX}`.trim()
}

const parseAddStateDamageEffectName = (func) => {
    return parseAddStateExternalBuffEffectName(func)
}

const parseAddStateShortGutsEffectName = (func, index) => {
    return parseAddStateExternalBuffEffectName(func, index)
}

const parseAddState = (func) => {
    if (func.buffs[0].type == "addIndividuality") {
        return parseAddStateIndividuality(func)
    }
    if (func.buffs[0].type == "fieldIndividuality") {
        return parseAddStateFieldIndividuality(func)
    }
    if (func.buffs[0].type == "selfturnendFunction") {
        return parseAddStateSelfTurnend(func)
    }
    if (func.buffs[0].type == "damageFunction") {
        return parseAddStateDamage(func)
    }
    if (func.buffs[0].type.startsWith("gutsFunction")) {
        return parseAddStateGuts(func)
    }
    if (func.buffs[0].type.startsWith("shortenSkillAfterUseSkill")) {
        return parseShortenSkillAfterUse(func)
    }
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

const parseAddStateIndividuality = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = Array(func.svals.length).fill("")

    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseAddStateFieldIndividuality = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = Array(func.svals.length).fill("")

    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseAddStateSelfTurnend = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType)
    const effectName = parseAddStateShortSelfTurnendEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectStateValues(growthType, dividerByEffectName(effectName), prefixByEffectName(effectName), suffixByEffectName(effectName), [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    if (additionalEffects[func.svals[0].Value]) {
        const addStateShortValue = additionalEffects[func.svals[0].Value].Value
        if (Array.isArray(addStateShortValue))
            values.splice(0, values.length, ...addStateShortValue)
        else
            values.fill(`${addStateShortValue}`)
    } else {
        console.log("unknown addStateShortSelfTurnend state: ", func.svals[0].Value)
    }
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseAddStateDamage = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseAddStateDamageEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectStateValues(growthType, dividerByEffectName(effectName), prefixByEffectName(effectName), suffixByEffectName(effectName), [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    if (additionalEffects[func.svals[0].Value]) {
        const addStateShortValue = additionalEffects[func.svals[0].Value].Value
        if (Array.isArray(addStateShortValue))
            values.splice(0, values.length, ...addStateShortValue)
        else
            values.fill(`${addStateShortValue}`)
    } else {
        console.log("unknown addStateDamage state: ", func.svals[0].Value)
    }

    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseAddStateGuts = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseAddStateShortGutsEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = Array(func.svals.length)
    if (additionalEffects[func.svals[0].Value]) {
        if (Array.isArray(additionalEffects[func.svals[0].Value])) {
            return additionalEffects[func.svals[0].Value].map((effect, index) => {
                const values = Array(func.svals.length).fill(`${effect.Value}`)
                return {
                    target,
                    text: parseAddStateShortGutsEffectName(func, index),
                    grow: growthType,
                    values
                }
            })
        } else {
            const addStateShortValue = additionalEffects[func.svals[0].Value].Value
            values.fill(`${addStateShortValue}`)
        }
    } else {
        console.log("unknown addStateGuts state: ", func.svals[0].Value)
        values.fill(``)
    }

    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseAddStateShort = (func) => {
    if (func.buffs[0].type.match(/(commandattackFunction|attackBeforeFunction|attackAfterFunction|attackFunction)/)) {
        return parseAddStateShortCommandAttack(func)
    }
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals) + overWriteTargetText(func.overWriteTvalsList)
    const effectName = parseEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, dividerByEffectName(effectName), prefixByEffectName(effectName), suffixByEffectName(effectName), [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])

    if (func.funcPopupText.length == 0 || (effectName.match(/やけど無効/) && !func.funcPopupText.match(/やけど無効/))) {
        return null
    }
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseAddStateShortCommandAttack = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseAddStateShortCommandAttackEffectName(func)
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = Array(func.svals.length).fill("")
    if (additionalEffects[func.svals[0].Value]) {
        if (Array.isArray(additionalEffects[func.svals[0].Value])) {
            return additionalEffects[func.svals[0].Value].map((effect, index) => {
                const values = Array(func.svals.length).fill(`${effect.Value}`)
                return {
                    target,
                    text: parseAddStateShortCommandAttackEffectName(func, index),
                    grow: growthType,
                    values
                }
            })
        } else {
            const addStateShortValue = additionalEffects[func.svals[0].Value].Value
            if (Array.isArray(addStateShortValue))
                values.splice(0, values.length, ...addStateShortValue)
            else
                values.fill(`${addStateShortValue}`)
        }
    } else {
        console.log("unknown addStateShortCommandAttack state: ", func.svals[0].Value)
    }

    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseSubStateCount = (count) => {
    return count ? `${count}つ` : ''
}
const parseSubState = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = parseTraitStateVals(func) + "状態を" + parseSubStateCount(func.svals[0].Value2) + "解除"
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

const parseGainNpIndividualSum = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "敵の数に応じてNP増加"
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

const parseGainMultiplyNp = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "NP倍化"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 10, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
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
    const effectName = parseEffectName(func)
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
    const values = parseDamageNpIndividualSumEffectValues(growthType, 10, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseDamageNpAndCheckIndividuality = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, null) + andCheckIndividuality(func.svals[0].AndCheckIndividualityList)
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
    const values = parseDamageNpIndividualEffectValues(growthType, 10, prefixByEffectName(effectName), '%', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
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

const parseShortenSkillAfterUse = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "スキル使用時 スキルチャージ短縮(スキル毎に1回限り)"
    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, '', '回', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseTransformServant = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "〔スーパー青子〕に変身"

    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = [ "-", "-", "-", "-", "-" ]
    
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

const parseForceInstantDeath = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = "即死"

    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseShotenBuffcount = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = func.funcPopupText

    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseDisplayBuffstring = (func) => {
    const target = targetText(func.funcTargetTeam, func.funcTargetType, func.functvals)
    const effectName = func.funcPopupText

    const growthType = parseGrowthType([func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    const values = parseEffectValues(growthType, 1, prefixByEffectName(effectName), '', [func.svals, func.svals2, func.svals3, func.svals4, func.svals5])
    
    return {
        target,
        text: effectName,
        grow: growthType,
        values
    }
}

const parseCardReset = (func) => ({
    target: "自身",
    text: "コマンドカードを配り直す",
    grow: "",
    values: [ "", "", "", "", "", "", "", "", "", "" ]
})

const parseMoveToLastSubmember = (func) => ({
    target: "自身",
    text: "控えに退避する<フィールドにいる味方が1騎のみの時は退避不能>",
    grow: "",
    values: [ "", "", "", "", "", "", "", "", "", "" ]
})

const parseNone = (func) => ({
    target: "自身",
    text: "なし",
    grow: "",
    values: [ "" ]
})

const functionParser = {
    "none": parseNone,
    "addStateShort": parseAddStateShort,
    "addState": parseAddState,
    "subState": parseSubState,
    "moveState": parseMoveState,
    "instantDeath": parseInstantDeath,
    "gainNp": parseGainNp,
    "gainNpIndividualSum": parseGainNpIndividualSum,
    "lossNp": parseLossNp,
    "gainMultiplyNp": parseGainMultiplyNp,
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
    "damageNpAndCheckIndividuality": parseDamageNpAndCheckIndividuality,
    "damageNpHpratioLow": parseDamageNpHpratioLow,
    "forceInstantDeath": parseForceInstantDeath,
    "transformServant": parseTransformServant,
    "shortenBuffcount": parseShotenBuffcount,
    "displayBuffstring": parseDisplayBuffstring,
    "shortenSkillAfterUseSkill": parseShortenSkillAfterUse,
    "cardReset": parseCardReset,
    "moveToLastSubmember": parseMoveToLastSubmember,
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
        if (Array.isArray(effect)) {
            effect.forEach((effect) => {
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
            })
        } else {
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

        if (skillSpec.effects.length == 0) {
            return acc
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
            num: skill.num,
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
                fs.writeFileSync(`debug-data.json`, JSON.stringify([servantData], null, 4))
            } catch (e) {
            }
        } else {
            console.log("parsing ", id)
        }
        const classe = classNames[servantData.className]
        const rare = servantData.rarity
        const gender = genderNames[servantData.gender]
        const attributes = attributeNames[servantData.attribute]
        const characteristics = traits2characteristics(servantData.traits, servantData.ascensionAdd.individuality.ascension)
        const hp = {
            min: servantData.hpBase,
            max: servantData.hpMax,
        }
        const attack = {
            min: servantData.atkBase,
            max: servantData.atkMax,
        }
        const growthCurve = growthCurve2Str(servantData.growthCurve)
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
        const npTypes = checkNPTypes(skills.np)

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

const getMaterialNames = () => iteminfo

const atlasJsonParser = {
    parseServantsJson,
    getMaterialNames,
}
module.exports = atlasJsonParser

