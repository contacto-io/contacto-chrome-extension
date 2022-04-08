import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'
import CssBaseline from '@material-ui/core/CssBaseline'
import { withStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import { Font, Colors } from './styles/styles'
import AppPreferences from './components/AppPreferences'

const styles = theme => ({
  container: {
    overflow: 'auto',
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: Colors.bg.white,
    color: Colors.neutrals.n1,
    height: 303,
    width: 360,
  },
  paper: {
    // marginTop: theme.spacing(2),
    // marginBottom: theme.spacing(2),
    height: 303,
    width: 360,
    boxShadow: 'none',
    overflow: 'hidden',
  },
})

const bodyFontStyle = {
  fontSize: Font.size.regular,
  fontFamily: Font.family.body,
}

const headerFontStyle = {
  fontFamily: Font.family.header,
}

const theme = createMuiTheme({
  typography: {
    subtitle1: {
      ...headerFontStyle,
      fontSize: Font.size.regular,
      fontWeight: Font.weight.bold,
    },
    subtitle2: {
      ...headerFontStyle,
      fontSize: Font.size.regular,
      fontWeight: Font.size.bold,
    },
    body1: bodyFontStyle,
    body2: bodyFontStyle,
    button: bodyFontStyle,
    input: bodyFontStyle,
    root: bodyFontStyle,
    h1: headerFontStyle,
    h2: headerFontStyle,
    h3: headerFontStyle,
    h4: headerFontStyle,
    h5: headerFontStyle,
    h6: headerFontStyle,
  },
  palette: {
    primary: {
      main: Colors.purple.darkest,
    },
    secondary: {
      main: Colors.blue.darkest,
    },
  },
})

function App({ classes }) {
  const [showSnackbar, setShowSnackbar] = useState(false)
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="sm" className={classes.container}>
        <CssBaseline />
        <Grid container direction="column" alignItems="center" justify="center">
          <Paper className={classes.paper}>
            {/* TODO: Change this to Login component once it's implemented */}
            <AppPreferences />
          </Paper>
        </Grid>
      </Container>
    </ThemeProvider>
  )
}

export default withStyles(styles)(
  App,
)
