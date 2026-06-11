"use client";

import Button from "@/app/components/Button";
import Register from "@/app/components/Register";
import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";
import { getUsers } from "@/app/services/userService";
import { UserData } from "@/app/types/User";
import { useEffect, useEffectEvent, useRef, useState } from "react";

export default function UsersPage() {
  const [formOpen, setFormOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const [users, setUsers] = useState<UserData[]>([]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const updateLoadUsers = useEffectEvent(() => {
    loadUsers();
  });

  useEffect(() => {
    updateLoadUsers();
  }, []);

  const userColumns: ColumnDef<UserData>[] = [
    {
      header: "Username",
      align: "left",
      render: (item) => item.username,
    },
    {
      header: "Role",
      render: (item) => item.role,
      cardRole: "title",
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 text-xs">
      <h1 className="text-lg sm:text-xl text-red-950 font-bold mb-4 shrink-0">
        User Management
      </h1>
      <Button
        onClick={() => setFormOpen(true)}
        className="md:w-40 sm:w-auto shrink-0 bg-green-900 hover:bg-green-700 text-white px-4 rounded"
      >
        Add User
      </Button>
      <Register
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }}
        heading="Register User"
      />

      <div className="flex-1 min-h-0 mt-5">
        <ResponsiveDataView
          data={users}
          columns={userColumns}
          getRowKey={(u) => u.id}
          emptyMessage="No Users"
          scrollable
        />
      </div>
    </div>
  );
}
