//
// convert atlas academy bgm(JP) json to json
//
// expected data from
//   https://api.atlasacademy.io/export/JP/nice_bgm.json
//

fs = require('fs')
ids = require('./ids')

const atlasjson = JSON.parse(fs.readFileSync(process.argv[2]))

const bgmList = {}

atlasjson.forEach((bgmData) => {
    if (!bgmData.notReleased) {
        const items = (bgmData.shop && bgmData.shop.payType == "item")
         ? { [ids.itemName2Id[bgmData.shop.cost.item.name]]: bgmData.shop.cost.amount }
         : {}
        bgmList[bgmData.id] = {
            id: bgmData.id,
            priority: bgmData.priority,
            name: bgmData.name,
            items
        }
    }
})

// fix priority
if (bgmList["367"].priority == bgmList["369"].priority) {
    bgmList["367"].priority++
    bgmList["365"].priority++
}

try {
    fs.writeFileSync("bgms.json", JSON.stringify(bgmList))
} catch (e) {
    console.log(e)
}
