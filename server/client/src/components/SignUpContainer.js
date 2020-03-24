import React from "react";
import { Paper, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    padding: "5vh",
    backgroundImage:
      "linear-gradient(to top, rgba(87,40,184,1) 25%, rgba(119,140,255,1) 100%)",
    height: "90vh"
  },
  signUp: {
    width: "50vw",
    maxHeight: "80vh",
    overflowY: "auto",
    padding: "5vh",
    textAlign: "center",
    rounded: true,
    backgroundColor: "white",
    margin: "auto"
  }
});

const SignUpContainer = props => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item xs={12} s={6}>
          <Paper className={classes.signUp} elevation={3}>
            {props.children}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default SignUpContainer;
