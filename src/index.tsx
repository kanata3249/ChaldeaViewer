import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from "@material-ui/core/CssBaseline"

import { appStore } from './app/store'
import { appTheme } from './app/theme'
import { TopPage } from './app/pages/topPage'

const store = appStore()
const theme = appTheme()

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TopPage>
      </TopPage>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
)