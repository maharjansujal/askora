"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/src/components/form/FormField";
import { Input } from "@/src/components/form/Input";
import { Textarea } from "@/src/components/form/Textarea";
import { Button } from "@/src/components/ui/Button";
import { categories } from "@/src/db/schema";
import { useCategories } from "../../hooks/useCategories";
import { useAlert } from "@/src/components/alert/useAlert";

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),

  slug: z
    .string()
    .trim()
    .min(1, "Category slug is required")
    .max(100, "Category slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),

  description: z.string().trim().max(500, "Description is too long").optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;
type Category = typeof categories.$inferSelect;

interface CategoryFormProps {
  onSuccess?: () => void;
  editingCategory?: Category;
}

export const CategoryForm = ({
  onSuccess,
  editingCategory,
}: CategoryFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: editingCategory?.name || "",
      slug: editingCategory?.slug || "",
    },
  });

  const {
    createCategory,
    isCreatingCategory,
    updateCategory,
    isUpdatingCategory,
  } = useCategories();

  const alert = useAlert();

  const isSubmitting = isCreatingCategory || isUpdatingCategory;

  const onSubmit = async (payload: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          ...payload,
        });
        alert.success("Updated subject successfully");
      } else {
        await createCategory(payload);
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
        label="Category name"
        required
        error={errors.name?.message}
        message="Enter a unique name for this category."
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
        message="Give a short description of what this category covers."
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
            ? editingCategory
              ? "Updating..."
              : "Adding..."
            : editingCategory
              ? "Update Category"
              : "Add Category"}
        </Button>
      </div>
    </form>
  );
};
