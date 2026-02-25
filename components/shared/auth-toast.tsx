"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function AuthToast() {
  const { isLoaded, isSignedIn, user } = useUser();
  const previousAuthRef = useRef<boolean | null>(null);

  useEffect(() => {
    // Wait until Clerk is fully loaded before tracking state
    if (!isLoaded) return;

    // Detect sign out
    if (previousAuthRef.current === true && !isSignedIn) {
      toast.info("Signed out successfully", {
        description: "See you next time!",
        duration: 3000,
      });
      sessionStorage.removeItem("auth-toast-shown");
    }

    // Detect sign in
    if (isSignedIn && user) {
      const isNewUser =
        Date.now() - new Date(user.createdAt!).getTime() < 60000;
      const lastSignIn = user.lastSignInAt ? user.lastSignInAt.getTime() : 0;
      const isRecentSignIn = Date.now() - lastSignIn < 30000;

      const hasToasted = sessionStorage.getItem("auth-toast-shown");

      if (!hasToasted) {
        sessionStorage.setItem("auth-toast-shown", "true");

        // We show the toast if we visually saw the transition (false -> true)
        // OR if this was a fresh load but a very recent sign-in/sign-up (like coming back from OAuth)
        if (previousAuthRef.current === false || isRecentSignIn || isNewUser) {
          if (isNewUser) {
            toast.success(
              `Welcome to the family, ${user.firstName || "Member"}! 🎉`,
              {
                description: "We're so glad you joined Chandra Jyoti Sanstha.",
                duration: 5000,
              }
            );
          } else {
            toast.success(`Welcome back, ${user.firstName || "Member"}! 👋`, {
              description: "It's great to see you again.",
              duration: 3000,
            });
          }
        }
      }
    }

    // Update ref to current state ONLY when user object matches isSignedIn state
    // This resolves the race condition where `isSignedIn` is true but `user` is temporarily null
    if (isSignedIn && user) {
      previousAuthRef.current = true;
    } else if (!isSignedIn) {
      previousAuthRef.current = false;
    }
  }, [isLoaded, isSignedIn, user]);

  return null; // This component doesn't render any visible UI directly
}
