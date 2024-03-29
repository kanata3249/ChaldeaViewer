import { createTheme } from "@material-ui/core/styles"
import * as colors from '@material-ui/core/colors'

const isDarkMode = () => matchMedia('(prefers-color-scheme: dark)').matches

export const appTheme = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: colors.blue[800],
      },
      secondary: {
        main: "#ffb74d"
      },
      type: isDarkMode() ? "dark" : "light",
    },
  })

  return theme
}