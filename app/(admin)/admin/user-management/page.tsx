"use client";

import { useAlert } from "@/src/components/alert/useAlert";
import { useConfirm } from "@/src/components/confirm/useConfirm";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal/Modal";
import { useModal } from "@/src/components/ui/Modal/useModal";
import { User } from "@/src/db/schema";
import { UserForm } from "@/src/features/admin/components/users/UserForm";
import { UserTable } from "@/src/features/admin/components/users/UserTable";
import { useUsers } from "@/src/features/admin/hooks/useUsers";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export default function UserManagementPage() {
  const userForm = useModal();
  const confirm = useConfirm();
  const alert = useAlert();
  const { users, banUser, isUsersLoading } = useUsers();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  async function handleBanUser(user: User) {
    const ok = await confirm("Are you sure you want to ban this user? ");
    if (!ok) return;
    await banUser(user.id);
    alert.success("User banned successfully");
  }

  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex justify-between w-full">
        <h1>Users</h1>
        <Button
          variant="secondary"
          icon={PlusIcon}
          onClick={() => userForm.openModal()}
        >
          Add User
        </Button>
      </div>
      <UserTable
        data={users}
        isLoading={isUsersLoading}
        onEdit={(user) => {
          setSelectedUser(user);
          userForm.openModal();
        }}
        onBan={handleBanUser}
      />
      <Modal open={userForm.open} onClose={userForm.closeModal}>
        <UserForm
          editingUser={selectedUser}
          onSuccess={() => {
            userForm.closeModal();
            setSelectedUser(null);
          }}
        />
      </Modal>
    </div>
  );
}
