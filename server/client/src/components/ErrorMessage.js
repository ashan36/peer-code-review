import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  container: {
    backgroundColor: "#e8176e",
    marginLeft: "20%",
    marginRight: "20%",
    marginTop: "1vh",
    marginBottom: "1vh",
    borderRadius: "1vh",
    boxShadow: "0.1vh 0.1vh 0.5vh grey",
    padding: ".5em"
  },
  text: {
    color: "white",
    lineHeight: "3vh",
    fontWeight: "800"
  }
});

const ErrorMessage = props => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <Typography className={classes.text}>{props.message}</Typography>
    </Box>
  );
};

export default ErrorMessage;
