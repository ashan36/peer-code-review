import React, { useState, useEffect, useContext } from "react";
import { Paper, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { SizeContext } from "context";

const useStyles = makeStyles({
  rootMed: {
    padding: "5vh",
    backgroundImage:
      "linear-gradient(to top, rgba(87,40,184,1) 25%, rgba(119,140,255,1) 100%)",
    height: "90vh"
  },
  rootSmall: {
    height: "100%",
    width: "100%"
  },
  signUpMed: {
    width: "50vw",
    maxHeight: "80vh",
    overflowY: "auto",
    padding: "5vh",
    textAlign: "center",
    rounded: true,
    backgroundColor: "white",
    margin: "auto"
  },
  signUpSmall: {
    paddingTop: "5vh",
    width: "100%",
    height: "100vh",
    overflowY: "auto",
    textAlign: "center",
    backgroundImage:
      "linear-gradient(to top, rgba(87,40,184,1) 15%, rgba(119,140,255,1) 100%)",
    margin: "auto"
  }
});

const SignUpContainer = props => {
  const classes = useStyles();
  const { width, height } = useContext(SizeContext);

  return (
    <div className={width < 900 ? classes.rootSmall : classes.rootMed}>
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item xs={12} s={6}>
          <Paper
            className={width < 900 ? classes.signUpSmall : classes.signUpMed}
            elevation={3}
          >
            {props.children}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default SignUpContainer;
