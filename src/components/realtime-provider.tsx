"use client";

import { useRealtime } from "@/hooks/use-realtime";
import { Wifi, WifiOff } from "lucide-react";

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { isConnected } = useRealtime();

  return (
    <>
      {children}
      {/* Connection indicator - only visible briefly */}
      <div className="fixed bottom-20 lg:bottom-4 right-4 z-50">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
            isConnected
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Connecting...</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
