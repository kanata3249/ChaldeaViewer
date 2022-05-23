//
// convert atlas academy servant(JP) json to json
//
// expected data from
//   https://api.atlasacademy.io/export/JP/nice_servant.json
//

fs = require('fs')
pako = require('pako')
atlasJsonParser = require('./atlasJsonParser')

const genServantCsv = (servantList, servantNames, atlasjson, startServantId) => {
    return atlasjson.reduce((acc, atlas) => {
        const servant = servantList[atlas.collectionNo]
        if (servant && servant.id >= startServantId) {
            const characteristics = servant.characteristics.split(" ")
            if (atlasJsonParser.genderNames[atlas.gender] == '-') {
                characteristics.splice(0, 1)
            }
            const columns = [
                servant.id, servantNames[servant.id], atlasJsonParser.classId2Name[servant.class], servant.rare,
                atlasJsonParser.growthCurve2Str(atlas.growthCurve), servant.hp.min, servant.attack.min, servant.hp.max, servant.attack.max, 
                atlasJsonParser.attirbuteId2Name[servant.attributes],
                atlas.noblePhantasms.slice(-1)[0].npGain.np[0] / 100, atlas.noblePhantasms.slice(-1)[0].npGain.defence[0] / 100,
                atlas.starGen / 10, atlas.starAbsorb,
                atlas.instantDeathChance / 10,
                atlas.hitsDistribution.arts.length,
                atlas.hitsDistribution.buster.length,
                atlas.hitsDistribution.quick.length,
                atlas.hitsDistribution.extra.length,
                servant.npTypes.slice(-1)[0].match(/補助/) ? 0 : atlas.noblePhantasms.slice(-1)[0].npDistribution.length,
                atlas.cards.map((cartType) => cartType.slice(0, 1).toUpperCase()).join(' '),
                atlasJsonParser.genderNames[atlas.gender],
                characteristics[0],
                characteristics[1],
                characteristics.slice(2).join(" "),
                atlas.id,
                servant.npTypes.map((npType) => npType.split(' ').reverse().join("")).join('\n')
            ]

            acc.push(
                '"' + columns.join('","') + '"\n'
            )
        }
        return acc
    }, []).sort((a, b) => {
        const aid = parseInt((a.match(/^\"(\d+)\"\,/) || ["0", "0"])[1])
        const bid = parseInt((b.match(/^\"(\d+)\"\,/) || ["0", "0"])[1])
        return aid - bid
    }).join("")
}

const genItemsCsv = (servantList, servantNames, startServantId) => {
    return Object.values(servantList).reduce((acc, servant) => {
        if (servant.id >= startServantId) {
            const itemsCsv = [ ...servant.items.ascension, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, ...servant.items.skill, ...servant.items.appendSkill ].map((items) => {
                const itemIds = Object.keys(items)
        
                itemIds.sort((a, b) => {
                    const aa = a >= 600 ? -a : a
                    const bb = b >= 600 ? -b : b
                    return aa - bb
                })
                return itemIds.map((itemId) => {
                    const itemName = atlasJsonParser.itemNames[itemId]
                    if (itemName == "QP") {
                        return `${items[itemId]}万QP`
                    } else {
                        return `${itemName}x${items[itemId]}`
                    }
                }, []).join('\n')
            })
            acc.push(
                `${servant.id},${servant.rare},"${servantNames[servant.id]}","${itemsCsv.join('","')}"`
            )
        }
        return acc
    }, []).join('\n')
}

const splitSkillText = ((text) => {
    const result = { preText: "", mainText: text, postText: "" }

    const [ turnText ] = result.mainText.match(/(\(\d.+\))$/) || [ undefined ]
    if (turnText) {
        result.postText = turnText
        result.mainText = result.mainText.slice(0, -turnText.length)
    }
    const [ postText ] = result.mainText.match(/(アップ|獲得|増加|ダウン|減少)$/) || [ undefined ]
    if (postText) {
        result.postText = postText + result.postText
        result.mainText = result.mainText.slice(0, -postText.length)
    }

    if (result.postText.length == 0) {
        result.postText = "-"
    }
    if (result.preText.length == 0) {
        result.preText = "-"
    }
    return [ result.preText, result.mainText, result.postText ]
})

const genSkillCsv = (servant, servantNames, skill) => {
    const npType = skill.npType?.split(/ /).join('\n') || ""
    const ct = skill.ct || ""
    const effects = skill.effects.reduce((acc, effect) => {
        const [ _, target, target2 ] = effect.target.match(/([^〔]+)(〔.+〕)?/)
        const [ preText, mainText, postText ] = splitSkillText(effect.text)
        acc.applyUser = [ ...acc.applyUser || [], '-' ]
        acc.target = [ ...acc.target || [], target ]
        acc.target2 = [ ...acc.target2 || [], target2 || "-" ]
        acc.pretext = [ ...acc.pretext || [], preText || "-" ]
        acc.mainText = [ ...acc.mainText || [], mainText ]
        acc.postText = [ ...acc.postText || [], postText ]
        acc.grow = [ ...acc.grow || [], effect.grow.length > 0 ? effect.grow : "-" ]
        acc.values = [ ...acc.values || [], []]
        effect.values.forEach((value, index) => {
            acc.values[index] = [ ...acc.values[index] || [], value.length > 0 ? value : "-" ]
        })
        return acc
    },{})
    return `,"${skill.name}",s${servant.id},"[[${servantNames[servant.id]}]]","${npType}",,,,,,,${ct},,,,,,`
            + `"${effects.applyUser?.join('\n')}","${effects.target?.join('\n')}","${effects.target2?.join('\n')}","${effects.pretext?.join('\n')}","${effects.mainText?.join('\n')}","${effects.postText?.join('\n')}"`
            + `,"${effects.grow?.join('\n')}",`
            + effects.values?.map((value) => `"${value.join('\n')}"`).join(',')
}

const genSkillsCsv = (servantList, servantNames, skills, startServantId) => {
    return Object.values(servantList).reduce((acc, servant) => {
        if (servant.id >= startServantId) {
            servant.skills.np.forEach((id) => acc.push(genSkillCsv(servant, servantNames, skills[id])))
            servant.skills.active.forEach((id) => acc.push(genSkillCsv(servant, servantNames, skills[id])))
            servant.skills.passive.forEach((id) => acc.push(genSkillCsv(servant, servantNames, skills[id])))
        }
        return acc
    }, []).join('\n')
}

const genAppendSkillsCsv = (servantList, servantNames, skills, startServantId) => {
    //"No.","Rare","Name","Class","アペンドスキル 1","アペンドスキル 2","アペンドスキル 3"
    return Object.values(servantList).reduce((acc, servant) => {
        if (servant.id >= startServantId) {
            acc.push(
                `${servant.id},${servant.rare},"${servantNames[servant.id]}","${atlasJsonParser.classId2Name[servant.class]}",`
                + `"${skills[servant.skills.append[0]].name}","${skills[servant.skills.append[1]].name}","${skills[servant.skills.append[2]].name}"`
            )
}
        return acc
    }, []).join('\n')
}

const atlasjson = JSON.parse(fs.readFileSync(process.argv[2]))
const gencsv = process.argv[3] == "gencsv"
const gencsvStartNo = gencsv && process.argv[4] || 1
const debugServantId = process.argv[gencsv ? 5 : 3]

const { servants, servantNames, skills } = atlasJsonParser.parseServantsJson(atlasjson, debugServantId)

if (gencsv) {
    try {
        fs.writeFileSync("91_servants.csv", genServantCsv(servants, servantNames, atlasjson, gencsvStartNo))
        fs.writeFileSync("92_skills.csv", genSkillsCsv(servants, servantNames, skills, gencsvStartNo))
        fs.writeFileSync("93_items.csv", genItemsCsv(servants, servantNames, gencsvStartNo))
        fs.writeFileSync("94_appendskill.csv", genAppendSkillsCsv(servants, servantNames, skills, gencsvStartNo))
    } catch(e) {
        console.log(e)
    }
}

try {
    fs.writeFileSync("servantdata.new.json", JSON.stringify(servants))
    //    fs.writeFileSync("servantdata.json.gz",  pako.deflate(JSON.stringify(servantList)))
    //    fs.writeFileSync("servantid2msid.json", JSON.stringify(servantId2msId))
    fs.writeFileSync("servantnames.new.json", JSON.stringify(servantNames))
    fs.writeFileSync("skills.new.json", JSON.stringify(skills))
    //    fs.writeFileSync("skills.json.gz", pako.deflate(JSON.stringify(skills)))
} catch (e) {
    console.log(e)
}
