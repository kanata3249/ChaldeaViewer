import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from "@mui/material/CssBaseline"

import { appTheme } from './app/theme'
import { TopPage } from './app/pages/topPage'

const theme = appTheme()

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element #root was not found')
}

createRoot(container).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <TopPage />
  </ThemeProvider>,
)