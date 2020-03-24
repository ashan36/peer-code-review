import React from "react";
import { Avatar } from "@material-ui/core";
import PersonIcon from "@material-ui/icons/Person";

const CustomAvatar = ({ user, avatarStyles }) => {
  return (
    <>
      {user.avatar.url !== "" ? (
        <Avatar
          alt={user.name}
          className={avatarStyles}
          src={user.avatar.url}
        ></Avatar>
      ) : (
        <Avatar alt={user.name} className={avatarStyles}>
          <PersonIcon />
        </Avatar>
      )}
    </>
  );
};

export default CustomAvatar;
