import { Inventory, validateInventory, itemNames } from './../fgo/inventory'
import { Servants, validateServants } from './../fgo/servants'
import { FilterValues } from './components/FilterDialog'

const defaultConfiguration = {
  modifyInventory: false
}

const makeKey = (name: string) => {
  return "chaldea/0/" + name
}

export const createBackup = () => {
  const backup = {
    version: 1,
    servants: loadServants()
                .filter((servant) => servant.npLevel > 0)
                .map(({ spec, itemCounts, totalItemsForMax, ...info } ) => ({ ...info })),
    inventory: Object.entries(loadInventory()).reduce((acc, [id, count]) => {
                acc[itemNames[id]] = count
                return acc
               },{})
  }
  return JSON.stringify(backup)
}

export const restoreBackup = (backupData: string) => {
  try {
    const backup = JSON.parse(backupData)
    switch (backup.version) {
    case 1:
      if (backup.servants && backup.inventory) {
        saveServants(validateServants(backup.servants))
        saveInventory(validateInventory(Object.entries(itemNames).reduce((acc, [itemId, name]) => {
          acc[itemId] = backup.inventory[name]
          return acc
        }, {})))
        return true
      }
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

export const loadFilter = (key: string): FilterValues => {
  return JSON.parse(localStorage.getItem(makeKey(`filterValues/${key}`)))
}

export const saveFilter = (key: string, filterValues: FilterValues) => {
  localStorage.setItem(makeKey(`filterValues/${key}`), JSON.stringify(filterValues))
}

export const loadModifyInventory = (): boolean => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration

  return configuration.modifyInventory
}

export const saveModifyInventory = (value: boolean) => {
  const configuration = JSON.parse(localStorage.getItem(makeKey('configuration'))) || defaultConfiguration

  configuration.modifyInventory = value
  localStorage.setItem(makeKey('configuration'), JSON.stringify(configuration))
}
