"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });

      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button className="logout-nav" disabled={isLoggingOut} onClick={handleLogout} type="button">
      {isLoggingOut ? <LoadingSpinner label="Birimo gusohoka..." small /> : "Sohoka"}
    </button>
  );
}
