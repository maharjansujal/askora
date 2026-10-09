"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/src/components/form/FormField";
import { Input } from "@/src/components/form/Input";
import { Textarea } from "@/src/components/form/Textarea";
import { Button } from "@/src/components/ui/Button";
import { useSubjects } from "../../hooks/useSubjects";
import { subjects } from "@/src/db/schema";
import { useAlert } from "@/src/components/alert/useAlert";

const subjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Subject name is required")
    .max(100, "Subject name is too long"),

  slug: z
    .string()
    .trim()
    .min(1, "Subject slug is required")
    .max(100, "Subject slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),

  description: z.string().trim().max(500, "Description is too long").optional(),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;
type Subject = typeof subjects.$inferSelect;

interface SubjectFormProps {
  onSuccess?: () => void;
  editingSubject?: Subject;
}

export const SubjectForm = ({
  onSuccess,
  editingSubject,
}: SubjectFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: editingSubject?.name || "",
      slug: editingSubject?.slug || "",
      description: editingSubject?.description || "",
    },
  });

  const { createSubject, updateSubject, isCreatingSubject, isUpdatingSubject } =
    useSubjects();

  const alert = useAlert();

  const isSubmitting = isCreatingSubject || isUpdatingSubject;

  const onSubmit = async (payload: SubjectFormValues) => {
    try {
      if (editingSubject) {
        await updateSubject({
          id: editingSubject.id,
          ...payload,
        });
        alert.success("Updated subject successfully");
      } else {
        await createSubject(payload);
        alert.success("Created subject successfully");
      }
      onSuccess?.();
      reset();
    } catch (err) {
      console.log(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 p-10"
    >
      <FormField
        label="Subject name"
        required
        error={errors.name?.message}
        message="Enter a unique name for this subject."
      >
        <Input
          {...register("name")}
          placeholder="e.g. Mathematics"
          disabled={isSubmitting}
          error={!!errors.name}
          autoComplete="off"
        />
      </FormField>

      <FormField
        label="Slug"
        required
        error={errors.slug?.message}
        message="Use lowercase letters, numbers, and hyphens."
      >
        <Input
          {...register("slug")}
          placeholder="e.g. mathematics"
          disabled={isSubmitting}
          error={!!errors.slug}
          autoComplete="off"
        />
      </FormField>

      <FormField
        label="Description"
        error={errors.description?.message}
        message="Give a short description of what this subject covers."
      >
        <Textarea
          {...register("description")}
          placeholder="e.g. Mathematics covers algebra, geometry, calculus, and related topics."
          rows={5}
          disabled={isSubmitting}
          error={!!errors.description}
        />
      </FormField>

      {errors && (
        <p className="text-sm text-destructive">{errors.form?.message}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? editingSubject
              ? "Updating..."
              : "Adding..."
            : editingSubject
              ? "Update Subject"
              : "Add Subject"}
        </Button>
      </div>
    </form>
  );
};
