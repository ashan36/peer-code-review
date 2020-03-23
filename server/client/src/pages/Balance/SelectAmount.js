import React from "react";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import { Grid, Typography, Button, makeStyles, Paper } from "@material-ui/core";

const useStyles = makeStyles({
  text: {
    fontSize: "3vw",
    fontWeight: "800"
  },
  subtract: {
    fontSize: "2vw",
    color: "#F44335",
    cursor: "pointer"
  },
  subtractDisabled: {
    fontSize: "2vw",
    color: "#AAAAAA",
    cursor: "pointer"
  },
  add: {
    fontSize: "2vw",
    color: "#43DDC1",
    cursor: "pointer"
  },
  button: {
    backgroundColor: "#43DDC1",
    marginLeft: "30%",
    marginRight: "30%",
    marginTop: "1vh",
    marginBottom: "1vh",
    width: "30%"
  },
  creditCount: {
    backgroundColor: "rgba(119,140,255,.2)",
    alignContent: "center"
  }
});

const SelectAmount = ({
  credits,
  decrement,
  increment,
  setCheckout,
  balance
}) => {
  const classes = useStyles();
  return (
    <Grid container direction="column" justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography
          className={classes.text}
        >{`Balance: ${balance}`}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item xs={1}>
            <RemoveCircleOutlineIcon
              className={
                credits !== 1 ? classes.subtract : classes.subtractDisabled
              }
              onClick={decrement}
              disabled={credits === 1}
            />
          </Grid>
          <Grid item xs={1}>
            <Paper className={classes.creditCount} elevation={2}>
              <Typography className={classes.text}>{credits}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={1}>
            <AddCircleOutlineOutlinedIcon
              className={classes.add}
              onClick={increment}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button
          className={classes.button}
          onClick={setCheckout}
          color="primary"
          variant="contained"
        >
          Checkout
        </Button>
      </Grid>
    </Grid>
  );
};

export default SelectAmount;
