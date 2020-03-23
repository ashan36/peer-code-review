import React, { useState, useEffect } from "react";
import Profile from "./Profile";

const ProfileSize = ({ user, editable }) => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
    }
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [width]);
  return <Profile userProp={user} editable={editable} width={width} />;
};

export default ProfileSize;
