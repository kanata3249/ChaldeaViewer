//
// convert servant data csv to json
//
// Expected csv format.
// servant: id,msId,name,class,rank,ascension1,ascension2,ascension3,ascension4,skill1,skill2,skill3,skill4,skill5,skill6,skill7,skill8,skill9
//

fs = require('fs')
promisify = require('util').promisify
csv = require('csvtojson')
pako = require('pako')
atlasJsonParser = require('./atlasJsonParser')
ids = require('./ids')

const csv2json = async (file) => {
  return await csv({checkType:true}).fromFile(file)
}

const loadjson = async (file) => {
  return await promisify(fs.readFile)(file).then((raw) => JSON.parse(raw))
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
};

const validateCharacteristics = (text) => {
  return toZenKata(text)
}

const skillNoMap = {
  '1': { 'パラドクス・シリンダー C': 3 },
  '3': { '魔力放出 A': 1 },
  '4': { '魔力放出 A': 2, '直感 B': 1 },
  '5': { '皇帝特権（喝采） EX': 2 },
  '8': { '軍略 B': 1 },
  '18': { 'カリスマ C': 1 },
  '20': { '矢避けの加護 B': 2 },
  '21': { '戦闘続行 A': 2 },
  '22': { '皇帝特権 EX': 2 },
  '24': { '戦闘続行 A': 3 },
  '26': { '戦闘続行 A': 2 },
  '28': { 'カリスマ C': 1 },
  '30': { '奇蹟 D+': 2 },
  '38': { '仕切り直し C': 3 },
  '39': { '宗和の心得 B' : 3 },
  '41': { '吸血 C': 1, '魅惑の美声 A': 2 },
  '44': { '精神汚染 A': 3, '無辜の怪物 D': 1 },
  '46': { '吸血 C': 1, '拷問技術 A': 2 },
  '47': { '心眼（偽） B': 2, '戦闘続行 A': 3 },
  '49': { '反骨の相 B': 2 },
  '51': { '動物会話 C': 2, '天性の肉体 A': 3 },
  '52': { '変化 C': 2, '戦闘続行 A': 3 },
  '54': { '皇帝特権 A': 2 },
  '55': { '仕切り直し A': 2, '黄金律 B': 1, '戦闘続行 A': 3 },
  '56': { '変化 C': 1 },
  '57': { '戦闘続行 B': 2 },
  '58': { '怪力 B': 1 },
  '63': { 'カリスマ B': 3 },
  '65': { '星の開拓者 EX': 3, '黄金律 B': 2 },
  '67': { '高速神言 A': 1 },
  '68': { '心眼（偽） A': 3 },
  '71': { '心眼（真） B': 1 },
  '72': { '反骨の相 B': 2 },
  '73': { '直感 A': 2 },
  '76': { '魔力放出 A': 1, '直感 B': 2 },
  '77': { '星の開拓者 EX': 3 },
  '78': { 'カリスマ E': 3 },
  '85': { '魔力放出（炎） A': 2 },
  '89': { '直感 B': 2, '戦闘続行 B': 3, '堅忍の老境 A': 3 },
  '92': { '心眼（偽） A': 2 },
  '93': { '啓示 A': 1 },
  '95': { 'カリスマ A+': 1, '黄金律 A': 3 },
  '96': { '黄金律 A': 2 },
  '98': { '矢避けの加護 C': 2, '戦闘続行 A': 3 },
  '99': { 'カリスマ B': 2, '魅惑の美声 C': 3 },
  '101': { 'カリスマ B': 2 },
  '100': { 'マハトマ A++': 2 },
  '103': { '変化 C': 1 },
  '108': { '軍略 B': 2 },
  '109': { '魔術 B': 1 },
  '114': { '無窮の武練 A+': 1 },
  '115': { '動物会話 C': 2, '天性の肉体 A': 3 },
  '116': { '仕切り直し A': 2, '変化 A': 3, '鬼種の魔 A': 1, "大江の鬼あばれ A+": 2 },
  '118': { 'カリスマ B': 1, '皇帝特権 A': 2 },
  '119': { 'カリスマ B': 2, '魔力放出 A': 1 },
  '121': { '無窮の武練 A+': 2 },
  '123': { 'カリスマ E': 2, "不夜のカリスマ B": 2 },
  '125': { '矢避けの加護 C': 2, '無尽俵 EX': 3 },
  '126': { '軍略 C': 1 },
  '127': { '星の開拓者 EX': 3 },
  '128': { '女神変生（天） A': 3 },
  '131': { 'ビーチフラワー A+': 1 },
  '137': { '心眼（偽） B': 1 },
  '138': { '真紅の勇者伝説・劇場版 EX': 3 },
  '139': { '皇帝特権 A': 1 },
  '140': { '軍略 B': 2 },
  '144': { 'カリスマ A+': 1 },
  '145': { 'カリスマ A+': 2 },
  '147': { '怪力 A+': 1 },
  '154': { '信仰の加護 A+++': 2 },
  '158': { '怪力 B': 2 },
  '160': { '魔力放出 A': 1, '直感 A': 2 },
  '161': { '仕切り直し C': 2 },
  '163': { '加虐体質 A': 2 },
  '166': { '自己改造 EX': 3 },
  '170': { '拷問技術 A': 1 },
  '171': { 'カリスマ B': 1 },
  '186': { '宗和の心得 B': 1 },
  '189': { '変化 A+': 1 },
  '191': { '無辜の怪獣 EX': 1, 'オーバーロード改 C': 2, 'ファイナルエリチャン C': 3, 'オーバーロード改 C+': 2, },
  '192': { '高速神言 B': 1 },
  '204': { 'おぞましき燎原の火 A+': 3 },
  '207': { '心眼（真） A': 1 },
  '210': { '心眼（偽） C': 2 },
  '211': { 'カリスマ C+': 1 },
  '220': { '自己改造 EX': 1 },
  '230': { '吸血 C': 3 },
  '234': { '心眼（偽） A': 1 },
  '241': { '至上礼装・月霊髄液 EX': 3 },
  '257': { '嵐の航海者 A+': 1 },
  '261': { 'アクセルターン B': 1 },
  '281': { '最果ての加護（宇宙） B+': 3 },
  '293': { '心眼（真） B': 2 },
  '335': { '高速神言 B': 2 },
  '347': { '閉じるは現実の帳 EX': 3 },
}

const burnResistanceSkills = {
  "アテナル・サマースイーツ A": true,
}

const derrivedSkill = {
  "誉れ堅き雪花の壁": "今は脆き雪花の壁",    //s1
  "アマルガムゴート D": "時に煙る白亜の壁",  //s2
  "悲壮なる奮起の盾": "奮い断つ決意の盾",    //s3
  "バンカーボルト A": "誉れ堅き雪花の壁",    //s1
  "ブラックバレル B": "バンカーボルト A",   //s1
}

const isDerrivedSkill = (a, b) => {
  let matched = false
  if (a.condition != b.condition) {
    return false
  }
  if (derrivedSkill[a.name]) {
    return derrivedSkill[a.name] == b.name
  }
  a.effects.forEach((aEffect, aIndex) => {
    b.effects.forEach((bEffect, bIndex) => {
      if (aEffect.text.replace(/\(.*$/, "") == bEffect.text.replace(/\(.*$/, "")) {
        matched = true
      }
    })
  })
  if (matched) {
    return true
  }
  return false;
}

const nobleTraits2npType = (nobleTraits) => {
  const traits = nobleTraits.split(/\n/)

  if (traits.length) {
    return `${traits[0].substring(0, 1)} ${traits[1]}`
  }
  return ""
}

const genItemsArray = (servantList) => {
  return Object.values(servantList).reduce((acc, servant) => {
    const itemsByLevelString = (itemsByLevel) => itemsByLevel.map((items) => {
      const itemIds = Object.keys(items).map((name) => ids.itemName2Id[name]).filter((id) => id !== undefined)
      itemIds.sort((a, b) => {
        const aa = a >= 600 ? -a : a
        const bb = b >= 600 ? -b : b
        return aa - bb
      })
      return itemIds.reduce((acc, itemId) => {
        acc[itemId] = items[ids.itemNames[itemId]] >> 0
        return acc
      }, {})
    })
    if (servant.id)
      acc.push({ id: servant.id, items: { ascension: itemsByLevelString(servant.items.ascension), skills: itemsByLevelString(servant.items.skill), appendSkills: itemsByLevelString(servant.items.appendSkill) }})
    return acc
  }, [])
}

const genServantSkillsArray = (servantList) => {
  return Object.values(servantList).reduce((acc, servant) => {
    if (servant.id) {
      acc.push({ id: servant.id, skills: servant.skills })
    }
    return acc
  }, [])
}

const genAppendSkill3Array = (servantList) => {
  return Object.values(servantList).reduce((acc, servant) => {
    if (servant.id)
      acc.push({ id: servant.id, name: servant.skills.append[2].name })
    return acc
  },[])
}

const csvs = process.argv.slice(3)
Promise.all([loadjson(process.argv[2]), csv2json(csvs[0])])
.then(([atlasjson, servant_array]) => {

  const atlasServants = atlasJsonParser.parseServantsJson(atlasjson, undefined)
  const materialNames = atlasJsonParser.getMaterialNames()

  const servantId2msId = {}
  const servantList = {}
  const servantNames = {}

  servant_array.forEach((servant) => {
    if (servant.id != servant.msId) {
      if (servant.msId != "") {
        servantId2msId[Number.parseInt(servant.id)] = Number.parseInt(servant.msId)
      } else {
        servantId2msId[Number.parseInt(servant.id)] = -1
      }
    }
    servantNames[servant.id] = servant.name

    servantList[servant.id] = {
      id: servant.id,
      class: ids.className2Id[servant.class],
      rare: servant.rare,
      gender: servant.gender,
      attributes: ids.power2Id[servant.power],
      characteristics: servant.attribute + " " + validateCharacteristics(servant.characteristics),
      hp: { min: Number.parseInt(String(servant.minHP).replace(/,/,"")), max: Number.parseInt(String(servant.maxHP).replace(/,/,"")) },
      attack: { min: Number.parseInt(String(servant.minAtk).replace(/,/,"")), max: Number.parseInt(String(servant.maxAtk).replace(/,/,"")) },
      npTypes: [],
      skills: {np: [], active: [-1, -1, -1], passive: [], append: []},
    }
  })

  const fix_bogus_skill = (skill) => {
  }
  const servant_skills_array = genServantSkillsArray(atlasServants)

  const servantSkills = {}
  const skills = {}
  let skillId = 0
  servant_skills_array.forEach((servant_skills) => {
    [servant_skills.skills.np, servant_skills.skills.active, servant_skills.skills.passive].flat().forEach((skill) => {
      skillId++
      // patch
      fix_bogus_skill(skill)

      const skillType = skill.type
      const npType = skill.npType
      const name = skill.name
      const condition = skill.condition
      const owner = servant_skills.id
      const detail = skill.detail
      const effects = skill.effects

      skills[skillId] = {
        id: skillId,
        name: name,
        condition,
        type: skillType,
        detail: detail,
        effects: effects,
      }
      if (skillType == "np") {
        skills[skillId].npType = npType
      }
      if (skill.ct) {
        skills[skillId].ct = skill.ct
      }

      if (servantList[owner]) {
        if (skillType == "np") {
          servantList[owner].npTypes = [ ...servantList[owner].npTypes, npType ]
          servantList[owner].skills[skillType] = [ ...servantList[owner].skills[skillType], skillId ]
          if (servantList[owner].skills[skillType].length > 1) {
            console.log(`second np for ${servantNames[owner]}`)
          }
        } else if (skillType == "active") {
          const skillNo = skill.num - 1
          servantList[owner].skills.active[skillNo] = skillId
        } else {
          servantList[owner].skills[skillType].push(skillId)
        }
      }
    })
  })

  const items_array = genItemsArray(atlasServants)
  items_array.forEach((servant) => {
    if (servantList[servant.id]) {
      servantList[servant.id].items = {
        ascension: servant.items.ascension,
        skill: servant.items.skills,
        appendSkill: servant.items.appendSkills,
      }
    }
  })

  skillId = 10000
  const appendSkills = {}
  skills[skillId] = {
    id: skillId,
    name: "追撃技巧向上",
    type: "append",
    effects: [{
      target: "自身",
      text: "Extraカード性能アップ",
      grow: "Lv",
      values: [
        "30%", "32%", "34%", "36%", "38%", "40%", "42%", "44%", "46%", "50%"
      ]
    }],
  }
  skillId++
  skills[skillId] = {
    id: skillId,
    name: "魔力装填",
    type: "append",
    effects: [{
      target: "自身",
      text: "NP増加",
      grow: "Lv",
      values: [
        "10%", "11%", "12%", "13%", "14%", "15%", "16%", "17%", "18%", "20%"
      ]
    }],
  }
  skillId++
  skills[skillId] = {
    id: skillId,
    name: "特撃技巧向上",
    type: "append",
    effects: [{
      target: "自身",
      text: "クリティカル威力アップ",
      grow: "Lv",
      values: [
        "20%", "21%", "22%", "23%", "24%", "25%", "26%", "27%", "28%", "30%"
      ]
    }],
  }
  skillId++
  skills[skillId] = {
    id: skillId,
    name: "スキル再装填",
    type: "append",
    effects: [{
      target: "自身",
      text: "スキル使用時 スキルチャージ短縮(スキル毎に1回限り)",
      grow: "Lv",
      values: [
        "1回", "1回", "1回", "1回", "1回", "2回", "2回", "2回", "2回", "3回"
      ]
    }],
  }
  skillId++
  const appendskill3_array = genAppendSkill3Array(atlasServants)
  appendskill3_array.forEach((servant) => {
    const name = servant.name
    if (!appendSkills[name]) {
      const text = name.replace(/対(.*)攻撃適性/, "対$1攻撃力アップ").replace(/対(.*)クリティカル発生耐性/, "$1からのクリティカル発生耐性アップ")
      skillId++
      skills[skillId] = {
        id: skillId,
        name: name,
        type: "append",
        effects: [{
          target: "自身",
          text: text,
          grow: "Lv",
          values: [
            "20%", "21%", "22%", "23%", "24%", "25%", "26%", "27%", "28%", "30%"
          ]
        }],
      }
      appendSkills[name] = skillId
    }
    if (servantList[servant.id])
      servantList[servant.id].skills.append = [ 10000, 10001, appendSkills[name], 10002, 10003 ]
  })

  try {
    fs.writeFileSync("servantdata.json",  JSON.stringify(servantList))
    fs.writeFileSync("servantdata.json.gz",  pako.deflate(JSON.stringify(servantList)))
    fs.writeFileSync("servantId2msId.json", JSON.stringify(servantId2msId))
    fs.writeFileSync("servantNames.json", JSON.stringify(servantNames))
    fs.writeFileSync("skills.json",  JSON.stringify(skills))
    fs.writeFileSync("skills.json.gz", pako.deflate(JSON.stringify(skills)))
//    fs.writeFileSync("a.json", JSON.stringify(atlasServants, null, 2))
  } catch (e) {
    console.log(e)
  }

  Object.entries(servantList).forEach(([id, servant]) => {
    if (servant.skills.active.length > 3) {
      console.log("active", servant.skills.active.length, servantNames[id], servant.skills.active)
    }
  })
})
