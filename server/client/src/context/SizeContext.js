import React from "react";

const SizeContext = React.createContext({
  width: window.innerWidth,
  height: window.innerHeight
});

export { SizeContext };
