import React, { useContext } from "react";
import { UserContext } from "context/UserContext";
import Profile from "pages/Profile";

const MyProfile = () => {
  // user context
  const { user } = useContext(UserContext);

  return <Profile user={user} editable={true} />;
};

export default MyProfile;
