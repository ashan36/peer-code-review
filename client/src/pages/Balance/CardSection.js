import React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import ReactStripe from "./ReactStripe";

const useStyles = makeStyles({
  stripePayment: {
    height: "600px"
  }
});
const CardSection = ({ credits, setAddCredit }) => {
  const classes = useStyles();
  return (
    <Grid container direction="column" alignItems="center">
      <Grid
        item
        container
        xs={12}
        direction="column"
        className={classes.stripePayment}
      >
        <ReactStripe setAddCredit={setAddCredit} credits={credits} />
      </Grid>
      <Grid
        item
        container
        xs={8}
        direction="row"
        alignItems="center"
        justify="center"
      />
    </Grid>
  );
};

export default CardSection;
