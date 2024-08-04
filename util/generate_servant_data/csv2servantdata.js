//
// convert servant data csv to json
//
// Expected csv format.
// servant: id,msId,name,class,rank,ascension1,ascension2,ascension3,ascension4,skill1,skill2,skill3,skill4,skill5,skill6,skill7,skill8,skill9
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

Promise.all([csv2json(csvs[0]), csv2json(csvs[1]), csv2json(csvs[2]), csv2json(csvs[3])])
.then(([servant_array, skill_array, items_array, appendskill_array]) => {

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

  const servantSkills = {}
  const skills = {}
  let skillId = 0
  skill_array.forEach((skill) => {
    skillId++
    // patch
    if (skill.SkillName == "文明接触 D") {
      skill.CT = null
    }
    skill.PreText = skill.PreText.replace(/＆〔1177〕/g, "または〔妖精〕")
    skill.PreText = skill.PreText.replace(/〔2730〕/g, "〔虚数空間〕")
    skill.Target2 = skill.Target2.replace(/＆〔1177〕/g, "または〔妖精〕")
    skill.Target2 = skill.Target2.replace(/〔2730〕/g, "〔虚数空間〕")
    skill.Target2 = skill.Target2.replace(/〔2731〕/g, "〔領域外の生命〕")
    if (skill.SkillName.match("狂瀾怒濤・悪霊左府 B")) {
      skill.Value0 = skill.Value0.replace(/-$/, "120")
      skill.Value1 = skill.Value1.replace(/-$/, "120")
      skill.Value2 = skill.Value2.replace(/-$/, "120")
      skill.Value3 = skill.Value3.replace(/-$/, "120")
      skill.Value4 = skill.Value4.replace(/-$/, "120")
    }
    
    const skillType = skill.NobleTraits ? "np" : skill.CT ? "active" : "passive"
    const npType = nobleTraits2npType(skill.NobleTraits)
    const name = skillType != "np" ? skill.SkillName : skill.SkillName.replace(/^(.*[A-Z\+\-－]+).*$/, "$1")
    const condition = skill.Condition.length > 0 ? skill.Condition : undefined
    const owners = skill.Owners.split("\n").map((owner) => owner.replace(/s(\d+)/,"$1"))
    const effects = []

    const target = skill.Target.split(/\r?\n/)
    const target2 = skill.Target2.split(/\r?\n/)
    const preText = skill.PreText.split(/\r?\n/)
    const mainText = skill.MainText.split(/\r?\n/)
    const postText = skill.PostText.split(/\r?\n/)
    const grow = skill.Grow.split(/\r?\n/)
    const values = []
    if (grow.length == 1) {
      values.push([skill.Value0])
      values.push([skill.Value1])
      values.push([skill.Value2])
      values.push([skill.Value3])
      values.push([skill.Value4])
      values.push([skill.Value5])
      values.push([skill.Value6])
      values.push([skill.Value7])
      values.push([skill.Value8])
      values.push([skill.Value9])
    } else {
      if (grow[0] == "-") {
        if (typeof skill.Value0 == "number") {
          skill.Value0 = skill.Value0.toString()
          skill.Value1 = skill.Value1.toString()
          skill.Value2 = skill.Value2.toString()
          skill.Value3 = skill.Value3.toString()
          skill.Value4 = skill.Value4.toString()
          skill.Value5 = skill.Value5.toString()
          skill.Value6 = skill.Value6.toString()
          skill.Value7 = skill.Value7.toString()
          skill.Value8 = skill.Value8.toString()
          skill.Value9 = skill.Value9.toString()
        }
        skill.Value0 = skill.Value0.replace(/^-(.*)$/,"-\n$1")
        skill.Value1 = skill.Value1.replace(/^-(.*)$/,"-\n$1")
        skill.Value2 = skill.Value2.replace(/^-(.*)$/,"-\n$1")
        skill.Value3 = skill.Value3.replace(/^-(.*)$/,"-\n$1")
        skill.Value4 = skill.Value4.replace(/^-(.*)$/,"-\n$1")
        skill.Value5 = skill.Value5.replace(/^-(.*)$/,"-\n$1")
        skill.Value6 = skill.Value6.replace(/^-(.*)$/,"-\n$1")
        skill.Value7 = skill.Value7.replace(/^-(.*)$/,"-\n$1")
        skill.Value8 = skill.Value8.replace(/^-(.*)$/,"-\n$1")
        skill.Value9 = skill.Value9.replace(/^-(.*)$/,"-\n$1")
      }
      values.push(skill.Value0.split("\n"))
      values.push(skill.Value1.split("\n"))
      values.push(skill.Value2.split("\n"))
      values.push(skill.Value3.split("\n"))
      values.push(skill.Value4.split("\n"))
      values.push(skill.Value5.split("\n"))
      values.push(skill.Value6.split("\n"))
      values.push(skill.Value7.split("\n"))
      values.push(skill.Value8.split("\n"))
      values.push(skill.Value9.split("\n"))
    }
    switch(skillType) {
      case 'np':
        values.length = 5
        break;
      case 'passive':
        values.length = 1
        break;
    }

    target.forEach((v, index) => {
      if (mainText[index].match("やけど無効") && index > 0 && !burnResistanceSkills[name] ) {
        console.log("remove やけど無効 from", name, owners.reduce(((names, o) => names += " " + servantNames[o]), ""))
        return
      }
      if (mainText[index].match("ターゲット集中")) {
        values.forEach((value, vindex) => {
          if (!value[index].match(/%$/)) {
            values[vindex][index] = `${parseInt(value[index]) / 10}%`
          }
        })
      }
      effects.push( {
        target: target[index] + target2[index].replace(/^-$/,""),
        text: (preText[index] != "-" ? preText[index] + " " : "") + mainText[index] + (postText[index] != "-" ? postText[index] : ""),
        grow: grow[index] == "-" ? "" : grow[index],
        values: values.map((value) => value[index] == "-" ? "" : value[index].toString())
      })
    })
  
    skills[skillId] = {
      id: skillId,
      name: name,
      condition,
      type: skillType,
      effects: effects,
    }
    if (skillType == "np") {
      skills[skillId].npType = npType
    }
    if (skill.CT) {
      skills[skillId].ct = skill.CT
    }

    if (skillType == "active" && owners.length > 1) {
      owners.slice(1).forEach((owner) => {
        if (skillNoMap[owner] && skillNoMap[owner][name] ) {
        } else {
          if (!skillNoMap[owner]) {
            skillNoMap[owner] = {}
          }
          skillNoMap[owner][name] = 0
          console.log("skillNoMap should be updated", servantNames[owner], name)
        }
      })
    }
    owners.forEach((owner) => {
      if (servantList[owner]) {
        if (skillType == "np") {
          const oldNpIndex = servantList[owner].skills[skillType].findIndex((npId) => (skills[npId].npType == npType && skills[npId].condition == condition))
          if (oldNpIndex >= 0) {
            servantList[owner].skills[skillType][oldNpIndex] = skillId
          } else {
            servantList[owner].npTypes = [ ...servantList[owner].npTypes, npType ]
            servantList[owner].skills[skillType] = [ ...servantList[owner].skills[skillType], skillId ]
            if (servantList[owner].skills[skillType].length > 1) {
              console.log(`second np for ${servantNames[owner]}`)
            }
          }
        } else if (skillType == "active") {
          const skillNo = skillNoMap[owner] && skillNoMap[owner][name] || servantList[owner].skills[skillType].findIndex((v) => (v < 0)) + 1
          if (skillNo == 0) {
            if (servantList[owner].skills.active[0] >= 0 && isDerrivedSkill(skills[skillId], skills[servantList[owner].skills.active[0]]))
              servantList[owner].skills.active[0] = skillId
            else if (servantList[owner].skills.active[1] >= 0 && isDerrivedSkill(skills[skillId], skills[servantList[owner].skills.active[1]]))
              servantList[owner].skills.active[1] = skillId
            else if (servantList[owner].skills.active[2] >= 0 && isDerrivedSkill(skills[skillId], skills[servantList[owner].skills.active[2]]))
              servantList[owner].skills.active[2] = skillId
            else {
              if (condition) {
                // 青崎青子
                servantList[owner].skills[skillType].push(-1)
                servantList[owner].skills[skillType].push(-1)
                servantList[owner].skills[skillType].push(-1)
              }
              servantList[owner].skills[skillType][4 - 1] = skillId
            }
          } else {
            servantList[owner].skills[skillType][skillNo - 1] = skillId
          }
        } else {
          servantList[owner].skills[skillType].push(skillId)
        }
      }
    })
  })

  Object.values(servantList).forEach((servant) => {
    if (servant.skills.active[0] < 0
      || servant.skills.active[1] < 0
      || servant.skills.active[2] < 0) {
        servant.skills.active = []
      }
  })

  skills2 = Object.values(servantList).reduce((acc, servant) => {
    servant.skills.np.forEach((skillId) => {
      acc[skillId] = skills[skillId]
    })
    servant.skills.active.forEach((skillId) => {
      acc[skillId] = skills[skillId]
    })
    servant.skills.passive.forEach((skillId) => {
      acc[skillId] = skills[skillId]
    })
    return acc
  }, {})

  // items.csv
  items_array.forEach((servant) => {
    const items = {
      ascension: [
        parseItems(servant["再臨素材 1"]),
        parseItems(servant["再臨素材 2"]),
        parseItems(servant["再臨素材 3"]),
        parseItems(servant["再臨素材 4"]),
      ],
      skill: [
        parseItems(servant["スキル素材 1"]),
        parseItems(servant["スキル素材 2"]),
        parseItems(servant["スキル素材 3"]),
        parseItems(servant["スキル素材 4"]),
        parseItems(servant["スキル素材 5"]),
        parseItems(servant["スキル素材 6"]),
        parseItems(servant["スキル素材 7"]),
        parseItems(servant["スキル素材 8"]),
        parseItems(servant["スキル素材 9"]),
      ],
      appendSkill: [
        parseItems(servant["APスキル素材 1"]),
        parseItems(servant["APスキル素材 2"]),
        parseItems(servant["APスキル素材 3"]),
        parseItems(servant["APスキル素材 4"]),
        parseItems(servant["APスキル素材 5"]),
        parseItems(servant["APスキル素材 6"]),
        parseItems(servant["APスキル素材 7"]),
        parseItems(servant["APスキル素材 8"]),
        parseItems(servant["APスキル素材 9"]),
      ]

    }
    const servantId = servant["No."]
    if (servantList[servantId])
      servantList[servantId].items = items
    //    console.log("items for servant id: ", servant.id, items)
  })

  skillId = 10000
  const appendSkills = {}
  skills2[skillId] = {
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
  skills2[skillId] = {
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
  appendskill_array.forEach((servant) => {
    const name = servant["アペンドスキル 3"]
    if (!appendSkills[name]) {
      const text = name.replace(/対(.*)攻撃適性/, "対$1攻撃力アップ").replace(/対(.*)クリティカル発生耐性/, "$1からのクリティカル発生耐性アップ")
      skillId++
      skills2[skillId] = {
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
    if (servantList[servant["No."]])
      servantList[servant["No."]].skills.append = [ 10000, 10001, appendSkills[name] ]
  })

  try {
    fs.writeFileSync("servantdata.json",  JSON.stringify(servantList))
    fs.writeFileSync("servantdata.json.gz",  pako.deflate(JSON.stringify(servantList)))
    fs.writeFileSync("./servantId2msId.json", JSON.stringify(servantId2msId))
    fs.writeFileSync("servantNames.json", JSON.stringify(servantNames))
    fs.writeFileSync("skills.json",  JSON.stringify(skills2))
    fs.writeFileSync("skills.json.gz", pako.deflate(JSON.stringify(skills2)))
  } catch (e) {
    console.log(e)
  }

  Object.entries(servantList).forEach(([id, servant]) => {
    if (servant.skills.active.length > 3) {
      console.log("active", servant.skills.active.length, servantNames[id])
    }
  })
})
