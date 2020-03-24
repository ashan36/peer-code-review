import axios from "axios";
import socket from "./sockets";
var jwtDecode = require("jwt-decode");

const getToken = () => {
  let token = localStorage.getItem("peercode-auth-token");
  return token;
};

export const authHeader = () => ({ headers: { Authorization: getToken() } });

const decodeToken = token => {
  var decodedToken = jwtDecode(token);
  return decodedToken;
};

async function fetchUser(decodedToken) {
  async function getUser(id) {
    try {
      const { data } = await axios({
        url: `/user/${id}`,
        method: "get",
        headers: {
          "Content-Type": "application/json",
          ...authHeader().headers
        }
      });
      if (data.errors) {
        return {}; // if there is an error, return empty user object
      } else {
        if ((data.success = true)) {
          return data.user;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  // check for empty token
  if (!decodedToken) {
    return null;
  } else {
    let id = decodedToken.user._id;
    let userObject = await getUser(id);
    socket.login(id);
    return userObject;
  }
}

export const removeToken = () => {
  localStorage.removeItem("peercode-auth-token");
};

export const authJWT = async () => {
  let token = getToken();
  if (token) {
    let decodedToken = decodeToken(token);
    return await fetchUser(decodedToken);
  } else return null;
};
