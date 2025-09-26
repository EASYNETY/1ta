"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "@/lib/socket"; // should export the connected socket.io client
import { AnyAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

export default function SocketInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for server state updates and send them straight into Redux
    socket.on("state-update", (action: AnyAction) => {
      dispatch(action);
    });

    // Listen for real-time attendance updates
    socket.on("attendance_marked", (data: any) => {
      console.log("📊 Real-time attendance update:", data);
      toast.success(`Attendance marked for ${data.studentName || 'student'} in ${data.lecture || 'class'}`);

      // Dispatch custom action for attendance updates
      dispatch({
        type: 'attendance/realTimeUpdate',
        payload: data
      });
    });

    // Listen for payment status updates
    socket.on("payment_status_updated", (data: any) => {
      console.log("💳 Real-time payment update:", data);
      toast.success(`Payment status updated: ${data.status || 'completed'}`);

      dispatch({
        type: 'payment/realTimeUpdate',
        payload: data
      });
    });

    // Listen for ticket updates
    socket.on("ticket_updated", (data: any) => {
      console.log("🎫 Real-time ticket update:", data);
      toast.info(`Ticket #${data.ticketId || 'unknown'} updated: ${data.status || 'status changed'}`);

      dispatch({
        type: 'ticket/realTimeUpdate',
        payload: data
      });
    });

    // Listen for ticket responses
    socket.on("ticket_response_added", (data: any) => {
      console.log("💬 Real-time ticket response:", data);
      toast.info(`New response on ticket #${data.ticketId || 'unknown'}`);

      dispatch({
        type: 'ticket/responseAdded',
        payload: data
      });
    });

    // Listen for ticket assignments
    socket.on("ticket_assigned", (data: any) => {
      console.log("👤 Real-time ticket assignment:", data);
      toast.info(`Ticket #${data.ticketId || 'unknown'} assigned to you`);

      dispatch({
        type: 'ticket/assigned',
        payload: data
      });
    });

    // Listen for schedule/timetable updates
    socket.on("schedule_event_updated", (data: any) => {
      console.log("📅 Real-time schedule update:", data);
      toast.info(`Schedule updated: ${data.title || 'event'} ${data.type || 'modified'}`);

      dispatch({
        type: 'schedule/realTimeUpdate',
        payload: data
      });
    });

    // Listen for new schedule events
    socket.on("schedule_event_created", (data: any) => {
      console.log("📅 Real-time schedule event created:", data);
      toast.success(`New schedule event: ${data.title || 'event'}`);

      dispatch({
        type: 'schedule/eventCreated',
        payload: data
      });
    });

    // Listen for deleted schedule events
    socket.on("schedule_event_deleted", (data: any) => {
      console.log("📅 Real-time schedule event deleted:", data);
      toast.info(`Schedule event cancelled: ${data.title || 'event'}`);

      dispatch({
        type: 'schedule/eventDeleted',
        payload: data
      });
    });

    // Listen for discussion updates
    socket.on("discussion_message", (data: any) => {
      console.log("💬 Real-time discussion update:", data);
      toast.info(`New discussion message in ${data.roomId || 'room'}`);

      dispatch({
        type: 'discussion/realTimeUpdate',
        payload: data
      });
    });

    // Listen for new discussions
    socket.on("discussion_created", (data: any) => {
      console.log("💬 Real-time discussion created:", data);
      toast.success(`New discussion: ${data.title || 'topic'}`);

      dispatch({
        type: 'discussion/created',
        payload: data
      });
    });

    // Listen for payment received notifications
    socket.on("payment_received", (data: any) => {
      console.log("💰 Real-time payment received:", data);
      toast.success(`Payment received: ${data.amount || 'amount'} ${data.currency || 'NGN'}`);

      dispatch({
        type: 'payment/received',
        payload: data
      });
    });

    // Listen for payment failures
    socket.on("payment_failed", (data: any) => {
      console.log("❌ Real-time payment failed:", data);
      toast.error(`Payment failed: ${data.reason || 'unknown reason'}`);

      dispatch({
        type: 'payment/failed',
        payload: data
      });
    });

    // Listen for attendance statistics updates
    socket.on("attendance_statistics_updated", (data: any) => {
      console.log("📈 Real-time attendance statistics:", data);
      dispatch({
        type: 'attendance/statisticsUpdated',
        payload: data
      });
    });

    return () => {
      socket.off("state-update");
      socket.off("attendance_marked");
      socket.off("payment_status_updated");
      socket.off("ticket_updated");
      socket.off("ticket_response_added");
      socket.off("ticket_assigned");
      socket.off("schedule_event_updated");
      socket.off("schedule_event_created");
      socket.off("schedule_event_deleted");
      socket.off("discussion_message");
      socket.off("discussion_created");
      socket.off("payment_received");
      socket.off("payment_failed");
      socket.off("attendance_statistics_updated");
    };
  }, [dispatch]);

  return null; // nothing visual
}
