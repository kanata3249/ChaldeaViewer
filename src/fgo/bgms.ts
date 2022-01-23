
export type Bgm = {
  id: number
  spec: BgmSpec
  onsale: boolean
  reserved: boolean
  purchased: boolean
}

export type BgmSpec = {
  id: number
  priority: number
  name: string
  items: { [id: number]: number }
}

export type Bgms = Bgm[]

const bgmSpecs: {
  [id: number]: BgmSpec
} = require('./bgms.json')

const generateCleanBgms = () => {
  return Object.values(bgmSpecs).map((bgmSpec) => (
    { id: bgmSpec.id,
      spec: bgmSpec,
      onsale: true,
      reserved: false,
      purchased: Object.values(bgmSpec.items).length == 0,
    }
  )).sort((a, b) => a.spec.priority - b.spec.priority)
}

export const validateBgms = (bgms: Bgms): Bgms =>
{
  const result = generateCleanBgms()
  if (bgms) {
    result.forEach((resultBgm, index) => {
      const bgmIndex = bgms.findIndex((item) => (item.id == resultBgm.id))
      if (bgmIndex >= 0) {
        result[index].onsale = bgms[bgmIndex].onsale
        result[index].reserved = bgms[bgmIndex].reserved
        result[index].purchased = bgms[bgmIndex].purchased
      }
    })
  }
  return result
}
