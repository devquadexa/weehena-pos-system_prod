// app/components/UserBadge.tsx
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
      className={`flex items-center gap-1 my-auto mx-auto  text-base font-normal ${className}`}
    >
      <CircleUser className="size-6" /> {username}
    </span>
  );
}
