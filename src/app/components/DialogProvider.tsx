import React, { FC, useState } from 'react'

import { FilterDialog, FilterDefinition, FilterValues } from './FilterDialog'
import { ServantItemsDialog } from './ServantItemsDialog'

import { Servant } from '../../fgo/servants'
import { InventoryStatus } from '../../fgo/inventory'

type Prop = {
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

type DialogProviderContext = {
  showFilterDialog(filterValues: FilterValues,
                   defaultFilterValues: FilterValues,
                   filterDefinition: FilterDefinition[],
                   onClose: onCloseFilterDialog): void
  showServantItemsDialog(servant: Servant,
                         inventoryStatus: InventoryStatus): void
}

export const DialogProviderContext = React.createContext<DialogProviderContext>(null)

export const DialogProvider: FC<Prop> = (props) => {
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

  // Context
  const controllerContext: DialogProviderContext = {
    showFilterDialog,
    showServantItemsDialog,
  }

  return (
    <DialogProviderContext.Provider value={controllerContext}>
      {props.children}
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
    </DialogProviderContext.Provider>
  )
}