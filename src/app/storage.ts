import { Inventory, validateInventory, itemNames } from './../fgo/inventory'
import { Servants, validateServants } from './../fgo/servants'
import { FilterValues } from './components/FilterDialog'


export const createBackup = () => {
  const backup = {
    version: 1,
    servants: loadServants()
                .filter((servant) => servant.npLevel > 0)
                .map((servant) => ({ ...servant, servantInfo: {}, itemCounts: {}, totalItemsForMax: {} })),
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
  return localStorage.getItem("selectedInfo") || "Inventory"
}

export const saveSelectedInfo = (selectedInfo: string) => {
  localStorage.setItem("selectedInfo", selectedInfo)
}

export const loadInventory = () => {
  return validateInventory(JSON.parse(localStorage.getItem("inventory")))
}

export const saveInventory = (inventory: Inventory) => {
  localStorage.setItem("inventory", JSON.stringify(inventory))
}

export const loadServants = () => {
  return validateServants(JSON.parse(localStorage.getItem("servants")))
}

export const saveServants = (servants: Servants) => {
  localStorage.setItem("servants", JSON.stringify(servants))
}

export const loadFilter = (key: string): FilterValues => {
  return JSON.parse(localStorage.getItem(`filterValues/${key}`))
}

export const saveFilter = (key: string, filterValues: FilterValues) => {
  localStorage.setItem(`filterValues/${key}`, JSON.stringify(filterValues))
}
