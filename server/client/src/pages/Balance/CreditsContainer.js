import React from "react";
import { Paper, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    paddingTop: "15vh",
    height: "90vh"
  },
  signUp: {
    width: "50vw",
    maxHeight: "80vh",
    minHeight: "20vh",
    padding: "5vh 0",
    textAlign: "center",
    backgroundColor: "white",
    margin: "auto"
  }
});

const CreditsContainer = props => {
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

export default CreditsContainer;
