import React from "react";
import { Button, makeStyles } from "@material-ui/core";

const SubmitButton = props => {
  const useStyles = makeStyles({
    button: {
      backgroundColor: "#43DDC1",
      margin: "1vh auto",
      width: "20%"
    }
  });
  const classes = useStyles();

  const handleClick = () => {
    props.onChange();
  };

  return (
    <Button
      className={classes.button}
      variant="contained"
      color="primary"
      onClick={handleClick}
    >
      Submit
    </Button>
  );
};

export default SubmitButton;
