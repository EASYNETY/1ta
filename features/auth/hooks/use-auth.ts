"use client";

import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess, logout } from "@/features/auth/store/auth-slice";

// Mock Firebase Auth User type
interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  getIdToken: () => Promise<string>;
}

// Mock Firebase Auth
const mockFirebaseAuth = {
  currentUser: null as FirebaseUser | null,
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    // In a real implementation, this would be a listener
    callback(mockFirebaseAuth.currentUser);
    return () => {}; // Cleanup function
  },
  signInWithPopup: async () => {
    // Simulate Google sign-in
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a mock user
    const mockUser = {
      uid: "google-user-123",
      email: "user@example.com",
      displayName: "Google User",
      getIdToken: async () => "mock-id-token-123",
    };

    mockFirebaseAuth.currentUser = mockUser;
    return { user: mockUser };
  },
  signOut: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    mockFirebaseAuth.currentUser = null;
  },
};

export function useAuth() {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = mockFirebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        user.getIdToken().then((token) => {
          dispatch(
            loginSuccess({
              user: {
                id: user.uid,
                name: user.displayName || "User",
                email: user.email || "",
                role: "student", // Default role, would be fetched from your backend
              },
              token,
            }),
          );
        });
      } else {
        // User is signed out
        dispatch(logout());
      }

      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, [dispatch]);

  const signInWithGoogle = async () => {
    try {
      const result = await mockFirebaseAuth.signInWithPopup();
      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await mockFirebaseAuth.signOut();
      dispatch(logout());
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return {
    isInitialized,
    signInWithGoogle,
    signOut,
  };
}
