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
ids = require('./ids')

const csv2json = async (file) => {
  return await csv({checkType:true}).fromFile(file)
}

Promise.all([csv2json(process.argv[3])]).then(([costume_array]) => {
    const aid2id = {}
    const newCostumes = []
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
                    acc[ids.itemName2Id[item.item.name]] = item.amount
                    return acc
                }, {})
                items[ids.itemName2Id["QP"]] = servantData.costumeMaterials[aid].qp / 10000
                if (costumes[aid2id[aid]]) {
                    costumes[aid2id[aid]].items = items
                } else {
                    newCostumes.push(`${id}\t${aid}\t${Object.keys(items).map((itemId) => `${ids.itemNames[itemId]}\t${items[itemId]}`).join('\t')}`)
                    console.log("*** new costume found ***", id, servantData.name, aid)
                }
            })
        }
    })

    try {
        fs.writeFileSync("costumes.json",  JSON.stringify(costumes))
        if (newCostumes.length > 0) {
            fs.writeFileSync("95_costume.csv", newCostumes.join('\n'))
        }
      } catch (e) {
        console.log(e)
      }
})
