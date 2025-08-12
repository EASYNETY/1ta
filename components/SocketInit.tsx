"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "@/lib/socket"; // should export the connected socket.io client
import { AnyAction } from "@reduxjs/toolkit";

export default function SocketInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for server state updates and send them straight into Redux
    socket.on("state-update", (action: AnyAction) => {
      dispatch(action);
    });

    return () => {
      socket.off("state-update");
    };
  }, [dispatch]);

  return null; // nothing visual
}
