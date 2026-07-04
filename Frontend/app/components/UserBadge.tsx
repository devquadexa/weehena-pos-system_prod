"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { getUserFromToken } from "../services/userService";
import { CircleUser } from "lucide-react";

interface Props {
  className?: string;
}

export default function UserBadge({ className = "" }: Props) {
  const [username, setUsername] = useState<string | null>(null);

  //hydration fix
  const updateUserName = useEffectEvent(() => {
    const user = getUserFromToken();
    setUsername(user?.username ?? null);
  });

  useEffect(() => {
    updateUserName();
  }, []);

  if (!username) return null;

  return (
    <span
      className={`flex items-center gap-1.5 text-sm sm:text-base font-normal w-full max-w-xs sm:max-w-sm truncate ${className}`}
    >
      <CircleUser className="size-6 sm:size-6 shrink-0" />
      <span className="truncate">{username}</span>
    </span>
  );
}
