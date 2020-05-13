import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import "./Chat.css";

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState(""); //hooks
  const [room, setRoom] = useState("");
  const ENDPOINT = "localhost:5000";

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    //console.log(location.search);
    //console.log(data);

    socket = io(ENDPOINT);

    setName(name);
    setRoom(room);

    console.log(socket);
    socket.emit("join", { name: name, room: room }, () => {});
    return () => {
      socket.emit("disconnect");
    };
  }, [ENDPOINT, location.search]);

  return <h1>Chat</h1>;
};

export default Chat;
