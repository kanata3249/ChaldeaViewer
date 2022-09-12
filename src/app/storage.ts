import { Inventory, validateInventory, itemNames } from './../fgo/inventory'
import { Servants, validateServants, Costumes, validateCostumes } from './../fgo/servants'
import { Bgms, validateBgms } from './../fgo/bgms'
import { FilterValues } from './components/FilterDialog'

const defaultConfiguration = {
  modifyInventory: false
}

const makeKey = (name: string) => {
  return "chaldea/0/" + name
}

export const createBackup = () => {
  const backup = {
    version: 2,
    servants: loadServants()
                .filter((servant) => servant.npLevel > 0)
                .map(({ spec, itemCounts, totalItemsForMax, ...info } ) => ({ ...info })),
    inventory: Object.entries(loadInventory()).reduce((acc, [id, count]) => {
                acc[itemNames[id]] = count
                return acc
               },{}),
    costumes: loadCostumes().map(({ spec, ...info}) => ({ ...info })),
    bgms: loadBgms().map(({ spec, ...info}) => ({ ...info }))
  }
  return JSON.stringify(backup)
}

export const restoreBackup = (backupData: string) => {
  try {
    const backup = JSON.parse(backupData)
    switch (backup.version) {
    case 1:
      if (backup.servants && backup.inventory) {
        if (backup.inventory["鳳凰の羽"]) {
          backup.inventory["鳳凰の羽根"] = backup.inventory["鳳凰の羽"]
        }
        if (backup.inventory["虚陰の塵"]) {
          backup.inventory["虚影の塵"] = backup.inventory["虚陰の塵"]
        }
        if (backup.inventory["ホムンクルスベピー"]) {
          backup.inventory["ホムンクルスベビー"] = backup.inventory["ホムンクルスベピー"]
        }
        saveServants(validateServants(backup.servants))
        saveInventory(validateInventory(Object.entries(itemNames).reduce((acc, [itemId, name]) => {
          acc[itemId] = backup.inventory[name]
          return acc
        }, {})))
        return true
      }
      case 2:
        saveServants(validateServants(backup.servants))
        saveCostumes(validateCostumes(backup.costumes))
        saveBgms(validateBgms(backup.bgms))
        saveInventory(validateInventory(Object.entries(itemNames).reduce((acc, [itemId, name]) => {
          acc[itemId] = backup.inventory[name]
          return acc
        }, {})))
        return true

    }
    return false
  } catch (e) {
    return false
  }
}

export const loadSelectedInfo = () => {
  return localStorage.getItem(makeKey("selectedInfo")) || "ServantsSpec"
}

export const saveSelectedInfo = (selectedInfo: string) => {
  localStorage.setItem(makeKey("selectedInfo"), selectedInfo)
}

export const loadInventory = () => {
  return validateInventory(JSON.parse(localStorage.getItem(makeKey("inventory"))))
}

export const saveInventory = (inventory: Inventory) => {
  localStorage.setItem(makeKey("inventory"), JSON.stringify(inventory))
}

export const loadServants = () => {
  return validateServants(JSON.parse(localStorage.getItem(makeKey("servants"))))
}

export const saveServants = (servants: Servants) => {
  localStorage.setItem(makeKey("servants"), JSON.stringify(servants.map(({ spec, itemCounts, totalItemsForMax, ...info } ) => ({ ...info }))))
}

export const loadCostumes = () => {
  return validateCostumes(JSON.parse(localStorage.getItem(makeKey("costumes"))))
}

export const saveCostumes = (costumes: Costumes) => {
  localStorage.setItem(makeKey("costumes"), JSON.stringify(costumes.map(({ spec, ...info } ) => ({ ...info }))))
}

export const loadBgms = () => {
  return validateBgms(JSON.parse(localStorage.getItem(makeKey("bgms"))))
}

export const saveBgms = (bgms: Bgms) => {
  localStorage.setItem(makeKey("bgms"), JSON.stringify(bgms.map(({ spec, ...info } ) => ({ ...info }))))
}

export const loadFilter = (key: string): FilterValues => {
  return JSON.parse(localStorage.getItem(makeKey(`filterValues/${key}`)))
}

export const saveFilter = (key: string, filterValues: FilterValues) => {
  localStorage.setItem(makeKey(`filterValues/${key}`), JSON.stringify(filterValues))
}

export const loadModifyInventory = (table: string): boolean => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration

  switch (table) {
    case 'ServantTable':
      return configuration.modifyInventory
    case 'CostumeTable':
      return configuration.modifyInventoryOnCostumeTable
    case 'BgmTable':
      return configuration.modifyInventoryOnBgmTable
    }
  return false
}

export const saveModifyInventory = (table: string, value: boolean) => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration

  switch (table) {
    case 'ServantTable':
      configuration.modifyInventory = value
      break
    case 'CostumeTable':
      configuration.modifyInventoryOnCostumeTable = value
      break
    case 'BgmTable':
      configuration.modifyInventoryOnBgmTable = value
      break
    }
  
  localStorage.setItem(makeKey('configuration'), JSON.stringify(configuration))
}

export const loadShowBGM = (): boolean => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration

  return configuration.showBGM
}

export const saveShowBGM = (value: boolean): void => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration
  configuration.showBGM = value
  localStorage.setItem(makeKey('configuration'), JSON.stringify(configuration))
}

export const loadShowCostume = (): boolean => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration

  return configuration.showCostume
}

export const saveShowCostume = (value: boolean): void => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration
  configuration.showCostume = value
  localStorage.setItem(makeKey('configuration'), JSON.stringify(configuration))
}

export const loadShowDuplicated = (): boolean => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration

  return configuration.showDuplicated
}

export const saveShowDuplicated = (value: boolean): void => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration
  configuration.showDuplicated = value
  localStorage.setItem(makeKey('configuration'), JSON.stringify(configuration))
}