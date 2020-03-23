import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSnackbar } from "notistack";

const useStyles = makeStyles({
  root: {
    margin: "0",
    padding: "0"
  }
});

/**
 * Required props:
 * messages = an array of messages to display
 * openAlert = a boolean to tell the snackbars to enqueue
 * alertsClosed = a callback function for the component to call for the onClose event
 *
 * Optional props:
 * variant = 'default' | 'success' | 'error' | 'info'
 * autoHideDuration = number in milliseconds for onClose to automatically be called, if not specified, alert will be dismissed on click-away
 * anchorOrigin = { horizontal: { 'left' | 'center' | 'right' } , vertical: { 'top' | 'bottom' } }
 *
 * Documentation for notistack https://iamhosseindhv.com/notistack
 */

const AlertSnackbar = props => {
  const classes = useStyles();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { variant, anchorOrigin } = props;
  var { autoHideDuration } = props;

  if (autoHideDuration) {
    autoHideDuration = Number(autoHideDuration);
  } else {
    autoHideDuration = null;
  }

  useEffect(() => {
    if (props.openAlert) {
      props.messages.map(msg => {
        enqueueSnackbar(msg, {
          key: msg,
          autoHideDuration: autoHideDuration,
          onClose: props.alertsClosed,
          variant: variant,
          anchorOrigin: anchorOrigin
        });
      });
    } else {
      props.messages.map(() => {
        closeSnackbar();
      });
    }
    return () => {
      props.messages.map(() => {
        closeSnackbar();
      });
    };
  }, [props.openAlert]);

  return <div className={classes.root}></div>;
};

export default AlertSnackbar;
