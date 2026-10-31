import { Grid } from '@mui/material'
import { styled } from '@mui/material/styles'

export const TableRoot = styled('div')({
  height: '100%',
})

export const TableController = styled(Grid)({
  width: '100%',
  minHeight: 48,
  paddingRight: 8,
  paddingLeft: 8,
})

export const TableFixedController = styled(Grid)({
  width: '100%',
  height: 48,
  paddingRight: 8,
  paddingLeft: 8,
})

export const TableMaxHeightRoot = styled('div')({
  maxHeight: 'calc(100vh - 64px - 48px)',
})

export const TableSummaryItem = styled(Grid)({
  flexGrow: 1,
})

export const TableHeaderCell = styled('div')({
  padding: 4,
  paddingTop: 8,
})

export const TableOddCell = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  whiteSpace: 'nowrap',
  scrollbarWidth: 'none',
  overflow: 'hidden',
  padding: 4,
}))

export const TableEvenCell = styled('div')({
  whiteSpace: 'nowrap',
  scrollbarWidth: 'none',
  overflow: 'hidden',
  padding: 4,
})

export const SkillDescription = styled(Grid)({
  paddingLeft: 8,
  fontSize: 'smaller',
})

export const SkillDetail = styled(Grid)({
  fontSize: 'smaller',
  paddingBottom: 8,
})
