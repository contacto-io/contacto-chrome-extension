import { withStyles } from '@material-ui/core/styles'
import { Colors } from '../../styles/styles'
import Switch from '@material-ui/core/Switch'

const CustomizedSwitch = withStyles({
  switchBase: {
    color: Colors.neutrals.n6,
    '&$checked': {
      color: Colors.blue.darkest,
    },
    '&$checked + $track': {
      backgroundColor: Colors.blue.lightest,
    },
  },
  checked: {},
  track: {
    backgroundColor: Colors.neutrals.n8,
  },
})(Switch)

export default CustomizedSwitch
