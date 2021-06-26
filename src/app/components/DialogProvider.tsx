import React, { FC, useState } from 'react'

import { MSExchangeDialog } from './MSExchangeDialog'
import { FilterDialog, FilterDefinition, FilterValues } from './FilterDialog'
import { ServantInfoDialog } from './ServantInfoDialog'

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

type ServantInfoDialogState = {
  openFlag: boolean
  servant: Servant
  inventoryStatus: InventoryStatus
  page: "skills" | "items"
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
  showServantInfoDialog(servant: Servant, inventoryStatus: InventoryStatus, page: "skills" | "items"): void
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
  const initialFilterDialogState: FilterDialogState = {
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

  // ServantInfoDialog
  const initialServantInfoDialogState: ServantInfoDialogState = {
    openFlag: false,
    servant: null,
    inventoryStatus: [],
    page: "skills"
  }
  const [servantInfoDialogState, setServantInfoDialogState] = useState<ServantInfoDialogState>(initialServantInfoDialogState)
  
  const showServantInfoDialog = (servant: Servant, inventoryStatus: InventoryStatus, page: "skills" | "items") => {
    const newServantInfoDialogState = {
      openFlag: true,
      servant,
      inventoryStatus,
      page,
    }
    setServantInfoDialogState(newServantInfoDialogState)
  }
  const hideServantInfoDialog = () => {
    setServantInfoDialogState(initialServantInfoDialogState)
  }

  // Context
  const controllerContext: DialogProviderContext = {
    showMSExchangeDialog,
    showFilterDialog,
    showServantInfoDialog,
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
          servantInfoDialogState.openFlag
           && <ServantInfoDialog open={servantInfoDialogState.openFlag} onClose={hideServantInfoDialog}
                servant={servantInfoDialogState.servant} inventoryStatus={servantInfoDialogState.inventoryStatus}
                page={servantInfoDialogState.page} />
        )}
      </DialogProviderContext.Consumer>
    </DialogProviderContext.Provider>
  )
}