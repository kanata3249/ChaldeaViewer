import React, { FC, useState } from 'react'

import { MSExchangeDialog } from './MSExchangeDialog'
import { FilterDialog, FilterDefinition, FilterValues } from './FilterDialog'
import { ServantItemsDialog } from './ServantItemsDialog'
import { ServantSkillsDialog } from './ServantSkillsDialog'

import { Servant } from '../../fgo/servants'
import { InventoryStatus } from '../../fgo/inventory'

type Prop = {
}

type MSExchangeDialogState = {
  openFlag: boolean
  handleImportInventory(): void
  handleExportInventory(): string
  handleImportServants(): void
  handleExportServants(): string
}

type onCloseFilterDialog = (result: FilterValues) => void
type FilterDialogState = {
  openFlag: boolean
  filterValues: FilterValues
  defaultFilterValues: FilterValues
  filterDefinition: FilterDefinition[]
  onCloseFilterDialog: onCloseFilterDialog
}

type ServantItemsDialogState = {
  openFlag: boolean
  servant: Servant
  inventoryStatus: InventoryStatus
}

type ServantSkillsDialogState = {
  openFlag: boolean
  servant: Servant
}

type DialogProviderContext = {
  showMSExchangeDialog(handleImportInventory: (string) => void,
                        handleExportInventory: () => string,
                        handleImportServants: (string) => void,
                        handleExportServants: () => string),
  showFilterDialog(filterValues: FilterValues,
                   defaultFilterValues: FilterValues,
                   filterDefinition: FilterDefinition[],
                   onClose: onCloseFilterDialog): void
  showServantItemsDialog(servant: Servant,
                         inventoryStatus: InventoryStatus): void
  showServantSkillsDialog(servant: Servant): void
}

export const DialogProviderContext = React.createContext<DialogProviderContext>(null)

export const DialogProvider: FC<Prop> = (props) => {
  // MSExchangeDialog
  const initialMSExchangeDialogState = {
    openFlag: false,
    handleImportInventory: () => {},
    handleExportInventory: () => "",
    handleImportServants: () => {},
    handleExportServants: () => "",
  }
  const [msExchangeDialogState, setMSExchangeDialogState] = useState<MSExchangeDialogState>(initialMSExchangeDialogState)

  const showMSExchangeDialog = (handleImportInventory, handleExportInventory, handleImportServants, handleExportServants) => {
    const newMSExchangeDialogState = {
      openFlag: true,
      handleImportInventory,
      handleExportInventory,
      handleImportServants,
      handleExportServants
    }
    setMSExchangeDialogState(newMSExchangeDialogState)
  }
  const hideMSExchangeDialog = () => {
    setMSExchangeDialogState(initialMSExchangeDialogState)
  }

  // FilterDialog
  const initialFilterDialogState = {
    openFlag: false,
    filterValues: {},
    defaultFilterValues: {},
    filterDefinition: [],
    onCloseFilterDialog: (result: FilterValues) => {},
  }
  const [filterDialogState, setFilterDialogState] = useState<FilterDialogState>(initialFilterDialogState)

  const showFilterDialog = (filterValues, defaultFilterValues, filterDefinition, onClose) => {
    const newFilterDialogState = {
      openFlag: true,
      filterValues,
      defaultFilterValues,
      filterDefinition,
      onCloseFilterDialog: onClose
    }
    setFilterDialogState(newFilterDialogState)
  }
  const hideFilterDialog = (result: FilterValues) => {
    filterDialogState.onCloseFilterDialog(result)
    setFilterDialogState(initialFilterDialogState)
  }

  // ServantItemsDialog
  const initialServantItemsDialogState = {
    openFlag: false,
    servant: null,
    inventoryStatus: [],
  }
  const [servantItemsDialogState, setServantItemsDialogState] = useState<ServantItemsDialogState>(initialServantItemsDialogState)
  
  const showServantItemsDialog = (servant: Servant, inventoryStatus: InventoryStatus) => {
    const newServantItemsDialogState = {
      openFlag: true,
      servant,
      inventoryStatus
    }
    setServantItemsDialogState(newServantItemsDialogState)
  }
  const hideServantItemsDialog = () => {
    setServantItemsDialogState(initialServantItemsDialogState)
  }

  // ServantSkillsDialog
  const initialServantSkillsDialogState = {
    openFlag: false,
    servant: null,
  }
  const [servantSkillsDialogState, setServantSkillsDialogState] = useState<ServantSkillsDialogState>(initialServantSkillsDialogState)
  
  const showServantSkillsDialog = (servant: Servant) => {
    const newServantSkillsDialogState = {
      openFlag: true,
      servant,
    }
    setServantSkillsDialogState(newServantSkillsDialogState)
  }
  const hideServantSkillsDialog = () => {
    setServantSkillsDialogState(initialServantSkillsDialogState)
  }

  // Context
  const controllerContext: DialogProviderContext = {
    showMSExchangeDialog,
    showFilterDialog,
    showServantItemsDialog,
    showServantSkillsDialog
  }

  return (
    <DialogProviderContext.Provider value={controllerContext}>
      {props.children}
      <DialogProviderContext.Consumer>
        {(context) => (
          msExchangeDialogState.openFlag
           && <MSExchangeDialog open={msExchangeDialogState.openFlag} onClose={hideMSExchangeDialog}
           onImportServants={msExchangeDialogState.handleImportServants} onExportServants={msExchangeDialogState.handleExportServants}
           onImportInventory={msExchangeDialogState.handleImportInventory} onExportInventory={msExchangeDialogState.handleExportInventory} />
        )}
      </DialogProviderContext.Consumer>
      <DialogProviderContext.Consumer>
        {(context) => (
          filterDialogState.openFlag
           && <FilterDialog open={filterDialogState.openFlag} onClose={hideFilterDialog}
                values={filterDialogState.filterValues} defaultValues={filterDialogState.defaultFilterValues} filterDefinition={filterDialogState.filterDefinition} />
        )}
      </DialogProviderContext.Consumer>
      <DialogProviderContext.Consumer>
        {(context) => (
          servantItemsDialogState.openFlag
           && <ServantItemsDialog open={servantItemsDialogState.openFlag} onClose={hideServantItemsDialog}
                servant={servantItemsDialogState.servant} inventoryStatus={servantItemsDialogState.inventoryStatus}/>
        )}
      </DialogProviderContext.Consumer>
      <DialogProviderContext.Consumer>
        {(context) => (
          servantSkillsDialogState.openFlag
           && <ServantSkillsDialog open={servantSkillsDialogState.openFlag} onClose={hideServantSkillsDialog}
                servant={servantSkillsDialogState.servant} />
        )}
      </DialogProviderContext.Consumer>
    </DialogProviderContext.Provider>
  )
}