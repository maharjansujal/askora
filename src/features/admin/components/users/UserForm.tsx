import { Role, User, users } from "@/src/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUsers } from "../../hooks/useUsers";
import { useAlert } from "@/src/components/alert/useAlert";
import { FormField } from "@/src/components/form/FormField";
import { Input } from "@/src/components/form/Input";
import { Select } from "@/src/components/form/Select";
import { Textarea } from "@/src/components/form/Textarea";
import { Button } from "@/src/components/ui/Button";

const userFormSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required"),
  username: z.string().trim().min(1, "Username is required"),
  email: z.email("Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  bio: z.string(),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSuccess?: () => void;
  editingUser?: User | null;
}

export function UserForm({ onSuccess, editingUser }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      displayName: editingUser?.displayName || "",
      username: editingUser?.username || "",
      bio: editingUser?.bio || "",
      email: editingUser?.email || "",
      password: "",
      role: editingUser?.role || "USER",
    },
  });

  const { createUser, isCreatingUser, updateUser, isUpdatingUser } = useUsers();

  const alert = useAlert();

  const isSubmitting = isCreatingUser || isUpdatingUser;

  async function onSubmit(payload: UserFormValues) {
    try {
      if (editingUser) {
        await updateUser({
          id: editingUser.id,
          ...payload,
        });
        alert.success("Updated student successfully");
      } else {
        await createUser(payload);
        alert.success("User created successfully");
      }
      onSuccess?.();
    } catch (error) {
      console.log(error instanceof Error ? error.message : String(error));
    }
  }

  const roles: { label: string; value: Role }[] = [
    {
      label: "Admin",
      value: "ADMIN",
    },
    {
      label: "Moderator",
      value: "MODERATOR",
    },
    {
      label: "User",
      value: "USER",
    },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 p-10"
    >
      <FormField
        label="Student Name"
        error={errors.displayName?.message}
        required
      >
        <Input
          {...register("displayName")}
          placeholder="User's name"
          disabled={isSubmitting}
          error={!!errors.displayName}
          autoComplete="off"
        />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <Input
          {...register("email")}
          placeholder="User's email"
          type="email"
          disabled={isSubmitting}
          error={!!errors.email}
          autoComplete="off"
        />
      </FormField>

      <FormField label="Username" error={errors.username?.message} required>
        <Input
          {...register("username")}
          placeholder="User's name"
          disabled={isSubmitting}
          error={!!errors.username}
          autoComplete="off"
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        <Input
          {...register("password")}
          placeholder="User's password"
          disabled={isSubmitting}
          error={!!errors.password}
          type="password"
          autoComplete="off"
        />
      </FormField>

      <FormField label="Role" error={errors.role?.message} required>
        <Select options={roles}></Select>
      </FormField>

      <FormField label="Bio" error={errors.bio?.message}>
        <Textarea
          {...register("bio")}
          placeholder="User's bio"
          disabled={isSubmitting}
          error={!!errors.bio}
          autoComplete="off"
        />
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? editingUser
              ? "Updating..."
              : "Adding..."
            : editingUser
              ? "Update User"
              : "Add User"}
        </Button>
      </div>
    </form>
  );
}
