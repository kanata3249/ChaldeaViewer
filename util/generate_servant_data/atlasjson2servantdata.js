//
// convert atlas academy servant(JP) json to json
//
// expected data from
//   https://api.atlasacademy.io/export/JP/nice_servant.json
//

fs = require('fs')
pako = require('pako')
atlasJsonParser = require('./atlasJsonParser')

const genServantCsv = (servantList, servantNames, atlasjson, debugServantId) => {
    return atlasjson.reduce((acc, atlas) => {
        const servant = servantList[atlas.collectionNo]
        if (servant && servant.id >= debugServantId) {
            const characteristics = servant.characteristics.split(" ")
            const columns = [
                servant.id, servantNames[servant.id], atlasJsonParser.classId2Name[servant.class], servant.rare,
                atlasJsonParser.growthCurve2Str(atlas.growthCurve), servant.hp.min, servant.attack.min, servant.hp.max, servant.attack.max, 
                atlasJsonParser.attirbuteId2Name[servant.attributes],
                atlas.noblePhantasms[0].npGain.np[0] / 100, atlas.noblePhantasms[0].npGain.defence[0] / 100,
                atlas.starGen / 10, atlas.starAbsorb,
                atlas.instantDeathChance / 10,
                atlas.hitsDistribution.arts.length,
                atlas.hitsDistribution.buster.length,
                atlas.hitsDistribution.quick.length,
                atlas.hitsDistribution.extra.length,
                atlas.noblePhantasms[0].npDistribution.length,
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
    }, []).sort().join("")
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
                `${servant.id},${servant.rare},"${servantNames[servant.id]}","${itemsCsv.join('","')}"\n`
            )
        }
        return acc
    }, []).join()
}
const genSkillsCsv = (servantList, servantNames, debugServantId) => {
    return ""
}
const genAppendSkillsCsv = (servantList, servantNames, debugServantId) => {
    return ""
}

const atlasjson = JSON.parse(fs.readFileSync(process.argv[2]))
const gencsv = process.argv[3] == "gencsv"
const gencsvStartNo = gencsv && process.argv[4] || 1
const debugServantId = process.argv[gencsv ? 5 : 3]

const { servants, servantNames, skills } = atlasJsonParser.parseServantsJson(atlasjson, debugServantId)

if (gencsv) {
    const csv = [
        genServantCsv(servants, servantNames, atlasjson, gencsvStartNo),
        genItemsCsv(servants, servantNames, gencsvStartNo),
//        genSkillsCsv(servantList, servantNames, gencsvStartNo),
//        genAppendSkillsCsv(servantList, servantNames, gencsvStartNo),
    ].join('\n')
    try {
        fs.writeFileSync("servantdata.csv", csv)
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
