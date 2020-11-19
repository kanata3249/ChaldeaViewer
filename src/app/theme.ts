import { createMuiTheme } from "@material-ui/core/styles"
import * as colors from '@material-ui/core/colors'

const isDarkMode = () => matchMedia('(prefers-color-scheme: dark)').matches

export const appTheme = () => {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: colors.blue[800],
      },
      type: isDarkMode() ? "dark" : "light",
    },
  })

  return theme
}