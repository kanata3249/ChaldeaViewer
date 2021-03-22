//
// convert servant data csv to json
//
// Expected csv format.
// servant: id,msId,name,class,rank,ascension1,ascension2,ascension3,ascension4,skill1,skill2,skill3,skill4,skill5,skill6,skill7,skill8,skill9
//

fs = require('fs')
csv = require('csvtojson')
pako = require('pako')

const itemNames = {
200: "剣の輝石",
201: "弓の輝石",
202: "槍の輝石",
203: "騎の輝石",
204: "術の輝石",
205: "殺の輝石",
206: "狂の輝石",

210: "剣の魔石",
211: "弓の魔石",
212: "槍の魔石",
213: "騎の魔石",
214: "術の魔石",
215: "殺の魔石",
216: "狂の魔石",

220: "剣の秘石",
221: "弓の秘石",
222: "槍の秘石",
223: "騎の秘石",
224: "術の秘石",
225: "殺の秘石",
226: "狂の秘石",

300: "英雄の証",
301: "凶骨",
302: "竜の牙",
303: "虚影の塵",
304: "愚者の鎖",
305: "万死の毒針",
306: "魔術髄液",
307: "宵哭きの鉄杭",
308: "励振火薬",

400: "世界樹の種",
401: "ゴーストランタン",
402: "八連双晶",
403: "蛇の宝玉",
404: "鳳凰の羽根",
405: "無間の歯車",
406: "禁断の頁",
407: "ホムンクルスベピー",
408: "隕蹄鉄",
409: "大騎士勲章",
410: "追憶の貝殻",
411: "枯淡勾玉",
412: "永遠結氷",
413: "巨人の指輪",
414: "オーロラ鋼",
415: "閑古鈴",
416: "禍罪の矢尻",
417: "光銀の冠",
418: "神脈霊子",
419: "虹の糸玉",

500: "混沌の爪",
501: "蛮神の心臓",
502: "竜の逆鱗",
503: "精霊根",
504: "戦馬の幼角",
505: "血の涙石",
506: "黒獣脂",
507: "封魔のランプ",
508: "智慧のスカラベ",
509: "原初の産毛",
510: "呪獣胆石",
511: "奇奇神酒",
512: "暁光炉心",
513: "九十九鏡",
514: "真理の卵",
515: "煌星のカケラ",
516: "悠久の実",
517: "鬼炎鬼灯",

600: "セイバーピース",
601: "アーチャーピース",
602: "ランサーピース",
603: "ライダーピース",
604: "キャスターピース",
605: "アサシンピース",
606: "バーサーカーピース",

610: "セイバーモニュメント",
611: "アーチャーモニュメント",
612: "ランサーモニュメント",
613: "ライダーモニュメント",
614: "キャスターモニュメント",
615: "アサシンモニュメント",
616: "バーサーカーモニュメント",

800: "伝承結晶",
}

const itemName2Id = Object.keys(itemNames).reduce((acc, id) => {
  acc[itemNames[id]] = id
  return acc
}, {})

const className2Id = {
  "剣": 0,
  "弓": 1,
  "槍": 2,
  "騎": 3,
  "術": 4,
  "殺": 5,
  "狂": 6,
  "裁": 7,
  "讐": 8,
  "分": 9,
  "月": 10,
  "降": 11,
  "盾": 12,
}

const power2Id = {
  "天": 0,
  "地": 1,
  "人": 2,
  "星": 3,
  "獣": 4
}

const parseItems = (itemsText) => {
  return itemsText.split(",").reduce((acc, itemText) => {
    if (itemText != "") {
      const [item, count] = itemText.split(":")
      acc[itemName2Id[item]] = Number(count)
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

const derrivedSkill = {
  "誉れ堅き雪花の壁": "今は脆き雪花の壁",    //s1
  "アマルガムゴート D": "時に煙る白亜の壁",  //s2
  "悲壮なる奮起の盾": "奮い断つ決意の盾",    //s3
  "バンカーボルト A": "誉れ堅き雪花の壁",    //s1
  "ブラックバレル B": "バンカーボルト A",   //s1
}

const isDerrivedSkill = (a, b) => {
  let matched = false
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

Promise.all([csv2json(csvs[0]), csv2json(csvs[1])])
.then(([servant_array, skill_array]) => {

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
      class: className2Id[servant.class],
      rare: servant.rare,
      gender: servant.gender,
      attributes: power2Id[servant.power],
      characteristics: servant.attribute + " " + validateCharacteristics(servant.characteristics),
      hp: { min: Number.parseInt(String(servant.minHP).replace(/,/,"")), max: Number.parseInt(String(servant.maxHP).replace(/,/,"")) },
      attack: { min: Number.parseInt(String(servant.minAtk).replace(/,/,"")), max: Number.parseInt(String(servant.maxAtk).replace(/,/,"")) },
      npType: servant.npType,
      skills: {np: [], active: [], passive: []},
      items: {
        ascension: [
          parseItems(servant.ascension1),
          parseItems(servant.ascension2),
          parseItems(servant.ascension3),
          parseItems(servant.ascension4),
        ],
        skill: [
          parseItems(servant.skill1),
          parseItems(servant.skill2),
          parseItems(servant.skill3),
          parseItems(servant.skill4),
          parseItems(servant.skill5),
          parseItems(servant.skill6),
          parseItems(servant.skill7),
          parseItems(servant.skill8),
          parseItems(servant.skill9),
        ]
      }
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
    skill.PreText = skill.PreText.replace(/〔2730〕/g, "〔虚数空間〕")
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
    const name = skillType != "np" ? skill.SkillName : skill.SkillName.replace(/^(.*[A-Z\+]+).*$/, "$1")
    const owners = skill.Owners.split("\n").map((owner) => owner.replace(/s(\d+)/,"$1"))
    const effects = []

    const target = skill.Target.split("\n")
    const target2 = skill.Target2.split("\n")
    const preText = skill.PreText.split("\n")
    const mainText = skill.MainText.split("\n")
    const postText = skill.PostText.split("\n")
    const grow = skill.Grow.split("\n")
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
      if (mainText[index].match("やけど無効") && index > 0) {
        console.log("remove やけど無効 from", name, owners.reduce(((names, o) => names += " " + servantNames[o]), ""))
        return
      }
      effects.push( {
        target: target[index] + target2[index].replace(/^-$/,""),
        text: (preText[index] != "-" ? preText[index] + " " : "") + mainText[index] + postText[index],
        grow: grow[index] == "-" ? "" : grow[index],
        values: values.map((value) => value[index] == "-" ? "" : value[index])
      })
    })
  
    skills[skillId] = {
      id: skillId,
      name: name,
      type: skillType,
      effects: effects,
    }
    owners.forEach((owner) => {
      if (skillType == "np") {
        servantList[owner].skills[skillType] = [ skillId ]
      } else if (skillType == "active") {
        if (servantList[owner].skills.active.length >= 3) {
          if (isDerrivedSkill(skills[skillId], skills[servantList[owner].skills.active[0]]))
            servantList[owner].skills.active[0] = skillId
          else if (isDerrivedSkill(skills[skillId], skills[servantList[owner].skills.active[1]]))
            servantList[owner].skills.active[1] = skillId
          else if (isDerrivedSkill(skills[skillId], skills[servantList[owner].skills.active[2]]))
            servantList[owner].skills.active[2] = skillId
          else
            servantList[owner].skills[skillType].push(skillId)
        } else {
          servantList[owner].skills[skillType].push(skillId)
        }
      } else {
        servantList[owner].skills[skillType].push(skillId)
      }
    })
  })

  try {
    fs.writeFileSync("servantdata.json",  JSON.stringify(servantList))
    fs.writeFileSync("servantdata.json.gz",  pako.deflate(JSON.stringify(servantList)))
    fs.writeFileSync("servantid2msid.json", JSON.stringify(servantId2msId))
    fs.writeFileSync("servantnames.json", JSON.stringify(servantNames))
    fs.writeFileSync("skills.json",  JSON.stringify(skills))
    fs.writeFileSync("skills.json.gz", pako.deflate(JSON.stringify(skills)))
  } catch (e) {
    console.log(e)
  }

  Object.entries(servantList).forEach(([id, servant]) => {
    if (servant.skills.active.length > 3) {
      console.log("active", servant.skills.active.length, servantNames[id])
    }
  })
})
