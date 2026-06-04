"use client";

import Button from "@/app/components/Button";
import Register from "@/app/components/Register";
import { useRef, useState } from "react";

export default function UsersPage() {
  const [formOpen, setFormOpen] = useState(false);

   const inputRef = useRef<HTMLInputElement>(null);

   
  
  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 text-xs">
      <h1 className="text-lg sm:text-xl text-red-950 font-bold mb-4 shrink-0">
        User Management
      </h1>
      <Button
        onClick={() => setFormOpen(true)}
        className="md:w-1/3 sm:w-auto shrink-0 bg-green-900 hover:bg-green-700 text-white px-4 rounded"
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
    </div>
  );
}
