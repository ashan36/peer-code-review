import React from "react";
import logo from "../assets/images/logo.svg";

export const Logo = () => {
  const style = {
    backgroundImage: "url(" + logo + ")",
    backgroundSize: "150px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    height: "50px",
    width: "50px"
  };
  return <div style={style} />;
};
