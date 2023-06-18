//
// convert classscore data csv to json
//
// Expected csv format.
// id	required_id	ex_id	required_ex_id	class	condition	effect	effect_value	itemName	item	sand	qp
//

fs = require('fs')
csv = require('csvtojson')
pako = require('pako')
ids = require('./ids')

const parseItems = (itemsText) => {
  return itemsText.split("\n").reduce((acc, itemText) => {
    if (itemText.length) {
    const [item, count] = itemText.split("x")
    if (count) {
      if (ids.itemName2Id[item]) {
        acc[ids.itemName2Id[item]] = Number(count)
      }
    } else {
      acc[ids.itemName2Id["QP"]] = parseInt(itemText)
    }
    }
    return acc
  },{})
}

const csvs = process.argv.slice(2)

const csv2json = async (file) => {
  return await csv({checkType:true}).fromFile(file)
}

Promise.all([csv2json(csvs[0])])
.then(([classscore_array]) => {

  const classscore = classscore_array.reduce((acc, row) => {
    const items = row.itemName.split(/\n/).reduce((acc, itemName, index) => {
      acc[ids.itemName2Id[itemName]] = (typeof row.item == 'number') ? row.item : parseInt(row.item.split(/\n/)[index])
      return acc;
    }, {})
    const result_row = {
      id: row.id,
      class: ids.className2Id[row.class],
      nodeName: row.ex_id,
      prevNodeName: row.required_ex_id,
      effect: {
        condition: row.condition,
        text: row.effect,
        value: row.effect_value
      },
      items: {
        ...items,
        [ids.itemName2Id['星光の砂']]: row.sand || undefined,
        [ids.itemName2Id['QP']]: row.qp / 10000 || undefined,
      }
    }
    acc[row.id] = result_row

    return acc
  }, {})

  try {
    fs.writeFileSync("classscores.json",  JSON.stringify(classscore))
  } catch (e) {
    console.log(e)
  }
})
