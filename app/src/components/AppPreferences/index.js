/* global chrome */
import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { Colors, Font } from '../../styles/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import CustomizedSwitch from './CustomizedSwitch'
import SellularLogo from '../../assets/contacto-logo.png'
import { DesktopAppLauncherIcon } from '../../icons/icons'

const styles = theme => ({
  paper: {
    height: 'inherit',
    display: 'grid',
    gridTemplateRows: '1fr auto',
  },
  icon: { height: 30, width: 'auto' },
  directDialWrapper: { cursor: 'pointer' },
  titleText: {
    fontFamily: Font.family.body,
    color: Colors.blue.darkest,
    fontSize: Font.size.small,
    fontWeight: Font.weight.bold600,
    fontStyle: 'normal',
    lineHeight: '17px',
    letterSpacing: 'normal',
  },
  optionTitle: {
    fontFamily: Font.family.body,
    fontWeight: Font.weight.bold600,
    color: Colors.neutrals.n1,
    fontStyle: 'normal',
    lineHeight: 1.2,
    letterSpacing: 'normal',
  },
  optionSubTitle: {
    width: '60%',
    fontFamily: Font.family.body,
    color: Colors.neutrals.n4,
  },
  subList: {
    paddingBottom: theme.spacing(2),
  },
  preferencesHeader: {
    padding: theme.spacing(2, 3),
    backgroundColor: Colors.purple.basicLight,
  },
  optionsList: {
    padding: theme.spacing(3, 3),
  },
  customizedSwitch: {
    paddingRight: theme.spacing(1.5),
  },
  footer: {
    cursor: 'pointer',
    borderTop: `0.5px solid ${Colors.neutrals.n8}`,
    paddingTop: 12,
    paddingBottom: 18,
  },
  launcher: {
    fontFamily: Font.family.body,
    paddingLeft: theme.spacing(1),
    fontWeight: Font.weight.bold600,
    color: Colors.neutrals.n4,
  },
})

class AppPreferences extends Component {
  state = {
    shouldDialDirectly: false,
  }

  componentDidMount() {
    try {
      chrome.storage.local.get(
        ['dialDirectly'],
        function(result) {
          this.setState({
            shouldDialDirectly: !!result.dialDirectly,
          })
        }.bind(this),
      )
    } catch (error) {
      // Handle error
    }
  }

  toggleState = () => {
    const changedValue = !this.state.shouldDialDirectly
    try {
      chrome.storage.local.set(
        { dialDirectly: changedValue },
        function() {
          this.setState({ shouldDialDirectly: changedValue })
        }.bind(this),
      )
    } catch (error) {
      // Handle error
    }
  }

  render() {
    const { classes } = this.props
    return (
      <div className={classes.paper}>
        <Grid>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            className={classes.preferencesHeader}
          >
            <Typography>
              <img src={SellularLogo} className={classes.icon} />
            </Typography>
            <Typography className={classes.titleText}>Chrome Extension</Typography>
          </Grid>
          <Grid className={classes.optionsList}>
            <Grid
              container
              justify="space-between"
              alignItems="center"
              className={classes.directDialWrapper}
              onClick={this.toggleState}
            >
              <Typography className={classes.optionTitle} component="div">
                Click-to-Dial
              </Typography>
              <CustomizedSwitch
                className={classes.customizedSwitch}
                checked={this.state.shouldDialDirectly}
                color="primary"
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            </Grid>
            <Grid className={classes.subList}>
              <Typography className={classes.optionSubTitle}>
                Automatically place calls with the default caller ID
              </Typography>
            </Grid>
            <Divider light />
          </Grid>
        </Grid>
        <Grid
          container
          justify="center"
          alignItems="center"
          className={classes.footer}
          onClick={() => {
            const href = 'contacto://open-app'
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              var tab = tabs[0]
              chrome.tabs.update(tab.id, { url: href })
            })
          }}
        >
          <DesktopAppLauncherIcon />
          <Typography className={classes.launcher}>Open App</Typography>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(AppPreferences)
