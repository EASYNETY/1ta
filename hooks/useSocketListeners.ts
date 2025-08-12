import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "@/lib/socket"; // Your socket.io client instance

export default function useSocketListeners() {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on("state-update", (action) => {
      // Dispatch the server-sent Redux action
      dispatch(action);
    });

    return () => {
      socket.off("state-update");
    };
  }, [dispatch]);
}
