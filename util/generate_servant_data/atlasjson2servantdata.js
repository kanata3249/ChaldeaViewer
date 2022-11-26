//
// convert atlas academy servant(JP) json to json
//
// expected data from
//   https://api.atlasacademy.io/export/JP/nice_servant.json
//

fs = require('fs')
pako = require('pako')
atlasJsonParser = require('./atlasJsonParser')
ids = require('./ids')

const genServantIdMap = (servantList, atlasjson) => {
    return atlasjson.reduce((acc, atlas) => {
        if (servantList[atlas.collectionNo]) {
            acc[atlas.collectionNo] = atlas.id
        }
        return acc
    },{})
}

const genServantCsv = (servantList, atlasjson, servantIds) => {
    return atlasjson.reduce((acc, atlas) => {
        const servant = servantList[atlas.collectionNo]
        if (servant && servantIds.includes(servant.id)) {
            const characteristics = servant.characteristics.split(" ")
            if (servant.gender == '-') {
                const genderUnknown = characteristics[0] 
                characteristics[0] = characteristics[1]
                characteristics[1] = characteristics[2]
                characteristics[2] = genderUnknown
            }
            const columns = [
                servant.id, servant.name, servant.class, servant.rare,
                servant.growthCurve, servant.hp.min, servant.attack.min, servant.hp.max, servant.attack.max, 
                servant.attributes,
                atlas.noblePhantasms.slice(-1)[0].npGain.np[0] / 100, atlas.noblePhantasms.slice(-1)[0].npGain.defence[0] / 100,
                atlas.starGen / 10, atlas.starAbsorb,
                atlas.instantDeathChance / 10,
                atlas.hitsDistribution.arts.length,
                atlas.hitsDistribution.buster.length,
                atlas.hitsDistribution.quick.length,
                atlas.hitsDistribution.extra.length,
                servant.npTypes.slice(-1)[0].match(/補助/) ? 0 : atlas.noblePhantasms.slice(-1)[0].npDistribution.length,
                atlas.cards.map((cartType) => cartType.slice(0, 1).toUpperCase()).join(' '),
                servant.gender,
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

const genItemsCsv = (servantList, servantIds) => {
    return Object.values(servantList).reduce((acc, servant) => {
        if (servantIds.includes(servant.id)) {
            const itemsCsv = [ ...servant.items.ascension, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, ...servant.items.skill, ...servant.items.appendSkill ].map((items) => {
                const itemIds = Object.keys(items).map((name) => ids.itemName2Id[name]).filter((id) => id !== undefined)
                itemIds.sort((a, b) => {
                    const aa = a >= 600 ? -a : a
                    const bb = b >= 600 ? -b : b
                    return aa - bb
                })
                return itemIds.map((itemId) => {
                    const itemName = ids.itemNames[itemId]
                    if (itemName == "QP") {
                        return `${items[itemName]}万QP`
                    } else {
                        return `${itemName}x${items[itemName]}`
                    }
                }, []).join('\n')
            })
            acc.push(
                `${servant.id},${servant.rare},"${servant.name}","${itemsCsv.join('","')}"`
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

const genSkillCsv = (servant, skill) => {
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
    return `,"${skill.name}","s${servant.id}","[[${servant.name}]]","${npType}",,,,,,,${ct},,,,,,`
            + `"${effects.applyUser?.join('\n')}","${effects.target?.join('\n')}","${effects.target2?.join('\n')}","${effects.pretext?.join('\n')}","${effects.mainText?.join('\n')}","${effects.postText?.join('\n')}"`
            + `,"${effects.grow?.join('\n')}",`
            + effects.values?.map((value) => `"${value.join('\n')}"`).join(',')
}

const genSkillsCsv = (servantList, servantIds) => {
    return Object.values(servantList).reduce((acc, servant) => {
        if (servantIds.includes(servant.id)) {
            servant.skills.np.forEach((skill) => acc.push(genSkillCsv(servant, skill)))
            servant.skills.active.forEach((skill) => acc.push(genSkillCsv(servant, skill)))
            servant.skills.passive.forEach((skill) => acc.push(genSkillCsv(servant, skill)))
        }
        return acc
    }, []).join('\n')
}

const genAppendSkillsCsv = (servantList, servantIds) => {
    //"No.","Rare","Name","Class","アペンドスキル 1","アペンドスキル 2","アペンドスキル 3"
    return Object.values(servantList).reduce((acc, servant) => {
        if (servantIds.includes(servant.id)) {
            acc.push(
                `${servant.id},${servant.rare},"${servant.name}","${servant.class}",`
                + `"${servant.skills.append[0].name}","${servant.skills.append[1].name}","${servant.skills.append[2].name}"`
            )
}
        return acc
    }, []).join('\n')
}

const atlasjson = JSON.parse(fs.readFileSync(process.argv[2]))
const gencsv = process.argv[3] == "gencsv"
const gencsvIds = gencsv && process.argv[4].split(',').map((v) => parseInt(v, 10)) || [1]
const debugServantId = process.argv[gencsv ? 5 : 3]
const spread = (start, end) => {
    return Array(Math.max(end - start + 1, 1)).fill(start).map((v, index) => v + index)
}

const servants = atlasJsonParser.parseServantsJson(atlasjson, debugServantId)
const materialNames = atlasJsonParser.getMaterialNames()

if (gencsv) {
    try {
        const ids = gencsvIds.length == 1 ? spread(gencsvIds[0], 999) : gencsvIds
        fs.writeFileSync("91_servants.csv", genServantCsv(servants, atlasjson, ids))
        fs.writeFileSync("92_skills.csv", genSkillsCsv(servants, ids))
        fs.writeFileSync("93_items.csv", genItemsCsv(servants, ids))
        fs.writeFileSync("94_appendskill.csv", genAppendSkillsCsv(servants, ids))
        fs.writeFileSync("99_materialNames.json", JSON.stringify(materialNames, null, " "))

    } catch(e) {
        console.log(e)
    }
}

const servantNames = {}
const skills = {}
const skillIds = {}

const saveSkills = (skillArray) => {
    return skillArray.map((skill) => {
        const savedSkillId = skillIds[JSON.stringify(skill, null, 2)]
        if (!savedSkillId) {
            const newId = Object.keys(skills).length + 1
            skillIds[JSON.stringify(skill, null, 2)] = newId
            skill.id = newId
            skills[newId] = skill
            return skill.id
        } else {
            return savedSkillId
        }
    })
}

const converItemName2Id = (itemsArray) => {
    return itemsArray.map((item) => {
        return Object.keys(item).reduce((acc, name) => {
            if (ids.itemName2Id[name]) {
                acc[ids.itemName2Id[name]] = item[name]
            }
            return acc
        },{})
    })
}

Object.entries(servants).forEach(([servantId, servant]) => {
    servantNames[servantId] = servant.name

    servant.class = ids.className2Id[servant.class]
    servant.attributes = ids.power2Id[servant.attributes]
    servant.skills.np = saveSkills(servant.skills.np)
    servant.skills.active = saveSkills(servant.skills.active)
    servant.skills.passive = saveSkills(servant.skills.passive)
    servant.skills.append = saveSkills(servant.skills.append)
    servant.items.ascension = converItemName2Id(servant.items.ascension)
    servant.items.skill = converItemName2Id(servant.items.skill)
    servant.items.appendSkill = converItemName2Id(servant.items.appendSkill)

    delete servant.growthCurve
    delete servant.name
})

try {
    fs.writeFileSync("servantId.json", JSON.stringify(genServantIdMap(servants, atlasjson)))
    fs.writeFileSync("servantdata.new.json", JSON.stringify(servants))
    //    fs.writeFileSync("servantdata.json.gz",  pako.deflate(JSON.stringify(servantList)))
    //    fs.writeFileSync("servantid2msid.json", JSON.stringify(servantId2msId))
    fs.writeFileSync("servantnames.new.json", JSON.stringify(servantNames))
    fs.writeFileSync("skills.new.json", JSON.stringify(skills))
    //    fs.writeFileSync("skills.json.gz", pako.deflate(JSON.stringify(skills)))
} catch (e) {
    console.log(e)
}
