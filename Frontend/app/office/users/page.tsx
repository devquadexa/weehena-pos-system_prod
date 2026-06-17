"use client";

import Button from "@/app/components/Button";
import Register from "@/app/components/Register";
import ResponsiveDataView, {
  ColumnDef,
} from "@/app/components/ResponsiveDataView";
import { deleteUser, getUsers } from "@/app/services/userService";
import { UserData } from "@/app/types/User";
import { Trash2 } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import toast from "react-hot-toast";

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

  // Delete User
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure to delete this user?");
    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      await loadUsers();
      toast.success("user deleted successfully");
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Failed to delete user");
    }
  };

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
    {
      header: "Action",
      align: "center",
      cardRole: "actions",
      render: (user: UserData) => (
        <button
          onClick={() => handleDelete(user.id)}
          className="w-full lg:w-fit rounded text-red-800 hover:text-red-600 hover:bg-red-100 px-2 py-1"
        >
          <Trash2 className="size-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 text-xs">
      <h1 className="text-lg sm:text-xl text-red-950 font-bold mb-4 shrink-0">
        User Management
      </h1>
      <Button
        onClick={() => setFormOpen(true)}
        className="md:w-40 sm:w-auto shrink-0 lg:w-80 bg-green-900 hover:bg-green-700 text-white px-4 rounded"
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
          tableClassName="w-full border-2"
          scrollable
        />
      </div>
    </div>
  );
}
