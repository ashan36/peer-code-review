import React from "react";
import { Typography, TextField, Grid, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  input: {
    textAlign: "center",
    width: "100%",
    margin: "2vh"
  }
});

const ProfileName = ({
  name,
  changeName,
  email,
  changeEmail,
  isEditing,
  editable
}) => {
  const classes = useStyles();

  const edit = () => {
    if (isEditing) {
      return (
        <Grid container direction="column" alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              color="primary"
              defaultValue={name}
              onChange={changeName}
              variant="outlined"
              label="name"
              xs={4}
              className={classes.input}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              defaultValue={email}
              onChange={changeEmail}
              variant="outlined"
              label="email"
              xs={4}
              className={classes.input}
            />
          </Grid>
        </Grid>
      );
    } else {
      return (
        <div>
          <Typography variant="h3" color="primary">
            {name}
          </Typography>
          {editable && <Typography variant="h5"> {email} </Typography>}
        </div>
      );
    }
  };

  return edit();
};

export default ProfileName;
