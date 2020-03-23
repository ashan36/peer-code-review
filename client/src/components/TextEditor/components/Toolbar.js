import React, { useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  DeveloperMode,
  FormatQuote
} from "@material-ui/icons";

const Toolbar = props => {
  const [inlineFormatButtonState, setInlineFormatButtonState] = useState();
  const [blockFormatButtonState, setBlockFormatButtonState] = useState();

  useEffect(() => {
    setInlineFormatButtonState(props.inlineStyle);
  }, [props.inlineStyle]);

  useEffect(() => {
    setBlockFormatButtonState(props.blockStyle);
  }, [props.blockStyle]);

  const handleInlineFormatChange = (event, newFormats) => {
    setInlineFormatButtonState(newFormats);
    const style = event.currentTarget.getAttribute("value");
    props.onChange(style);
  };

  const handleBlockFormatChange = (event, newFormats) => {
    setBlockFormatButtonState(newFormats);
    const style = event.currentTarget.getAttribute("value");
    props.onChange(style);
  };

  //Prevent toolbar buttons from taking focus from the editor
  const preventDefault = event => {
    event.preventDefault();
  };

  if (props.readOnly) {
    return <div></div>;
  }
  return (
    <Grid container spacing={4} justify="flex-start">
      <Grid item xs={6} sm="auto" lg="auto">
        <ToggleButtonGroup
          value={inlineFormatButtonState}
          onChange={handleInlineFormatChange}
        >
          <ToggleButton value="BOLD" onMouseDown={preventDefault}>
            <FormatBold />
          </ToggleButton>
          <ToggleButton value="ITALIC" onMouseDown={preventDefault}>
            <FormatItalic />
          </ToggleButton>
          <ToggleButton value="UNDERLINE" onMouseDown={preventDefault}>
            <FormatUnderlined />
          </ToggleButton>
          <ToggleButton value="CODE" onMouseDown={preventDefault}>
            CODE
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
      <Grid item xs={6} sm={4} lg={1}>
        <ToggleButtonGroup
          value={blockFormatButtonState}
          onChange={handleBlockFormatChange}
          exclusive
        >
          <ToggleButton
            value="unordered-list-item"
            onMouseDown={preventDefault}
          >
            <FormatListBulleted />
          </ToggleButton>
          <ToggleButton value="code-block" onMouseDown={preventDefault}>
            <DeveloperMode />
          </ToggleButton>
          <ToggleButton value="blockquote" onMouseDown={preventDefault}>
            <FormatQuote />
          </ToggleButton>
        </ToggleButtonGroup>
      </Grid>
    </Grid>
  );
};

export default Toolbar;
