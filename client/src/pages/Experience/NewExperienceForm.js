import React, { useState } from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import {
  Grid,
  InputLabel,
  Select,
  MenuItem,
  makeStyles
} from "@material-ui/core";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import { levels } from "utils";

const useStyles = makeStyles({
  dropdown: {
    width: "100%"
  },
  delete: {
    width: "4vw",
    color: "#F44335",
    cursor: "pointer"
  }
});

const NewExperienceForm = ({
  updateExperience,
  availableLanguages,
  language,
  index,
  deleteExperience,
  level,
  deletable
}) => {
  const classes = useStyles();
  const [selected, setSelected] = useState({
    language,
    level
  });

  const handleChange = name => async evt => {
    setSelected({ ...selected, [name]: evt.target.value });
  };

  useDeepCompareEffect(() => {
    // update experience at current index of experience section, with selected language as key
    // and level as property
    updateExperience(index, { [selected.language]: Number(selected.level) });
  }, [index, selected]);

  return (
    <Grid
      container
      className={classes.singleFormItem}
      spacing={2}
      direction="row"
      alignItems="center"
      justify="center"
    >
      <Grid item xs={1}>
        {deletable && (
          <RemoveCircleOutlineIcon
            className={classes.delete}
            onClick={() => deleteExperience(index)}
          />
        )}
      </Grid>
      <Grid item xs={10}>
        <Grid
          container
          spacing={1}
          direction="row"
          alignItems="center"
          justify="center"
        >
          <Grid item md={2} sm={12}>
            <InputLabel id="label" className={classes.label}>
              Language
            </InputLabel>
          </Grid>
          <Grid item md={4} sm={12}>
            <Select
              labelid="label"
              id="select"
              onChange={handleChange("language")}
              value={selected.language}
              name="language"
              className={classes.dropdown}
            >
              {// concatenate current languagee with available language, sort and map through for dropdown list
              [language]
                .concat(availableLanguages)
                .sort()
                .map(ele => (
                  <MenuItem value={ele} key={ele}>
                    {ele}
                  </MenuItem>
                ))}
            </Select>
          </Grid>

          <Grid item md={2} sm={12}>
            <InputLabel id="label">Level</InputLabel>
          </Grid>
          <Grid item md={4} sm={12}>
            <Select
              labelid="label"
              id="select"
              onChange={handleChange("level")}
              value={selected.level}
              name="level"
              className={classes.dropdown}
            >
              {levels.map((ele, idx) => (
                <MenuItem key={ele} value={idx + 1}>
                  {ele}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default NewExperienceForm;
