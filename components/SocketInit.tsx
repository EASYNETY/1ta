"use client";
import useSocketListeners from "@/hooks/useSocketListeners";

export default function SocketInit() {
  useSocketListeners();
  return null;
}
