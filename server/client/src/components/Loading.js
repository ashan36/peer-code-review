import React from "react";
import { CircularProgress } from "@material-ui/core";

const Loading = () => {
  const style = {
    height: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6E3ADB"
  };
  return (
    <div style={style}>
      <CircularProgress size="25vh" color="secondary"></CircularProgress>
    </div>
  );
};

export default Loading;
