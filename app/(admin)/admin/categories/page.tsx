"use client";

import { useAlert } from "@/src/components/alert/useAlert";
import { useConfirm } from "@/src/components/confirm/useConfirm";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal/Modal";
import { useModal } from "@/src/components/ui/Modal/useModal";
import { Category } from "@/src/db/schema";
import { CategoryForm } from "@/src/features/admin/components/categories/CategoryForm";
import { CategoriesTable } from "@/src/features/admin/components/categories/CategoryTable";
import { useCategories } from "@/src/features/admin/hooks/useCategories";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export default function CategoriesPage() {
  const {
    categories,
    isLoadingCategories,
    deleteCategory,
    isDeletingCategory,
  } = useCategories();
  const addCategoryModal = useModal();
  const editCategoryModal = useModal();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const alert = useAlert();
  const confirm = useConfirm();

  const handleDelete = async (category: Category) => {
    const ok = await confirm("Are you sure you want to delete this category?");
    if (!ok) return;
    await deleteCategory(category.id);
    alert.success("Category deleted successfully");
  };

  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex justify-between w-full">
        <h1>Categories</h1>
        <Button
          variant="secondary"
          icon={PlusIcon}
          onClick={() => addCategoryModal.openModal()}
        >
          Add Category
        </Button>
      </div>
      <CategoriesTable
        data={categories}
        isLoading={isLoadingCategories}
        onEdit={(category) => {
          setSelectedCategory(category);
          editCategoryModal.openModal();
        }}
        onDelete={handleDelete}
      />
      <Modal
        open={addCategoryModal.open}
        onClose={addCategoryModal.closeModal}
        title="Add category"
      >
        <CategoryForm onSuccess={addCategoryModal.closeModal} />
      </Modal>

      {selectedCategory && (
        <Modal
          {...editCategoryModal}
          onClose={editCategoryModal.closeModal}
          title="Update Category"
        >
          <CategoryForm
            onSuccess={() => {
              editCategoryModal.closeModal();
              setSelectedCategory(null);
            }}
            editingCategory={selectedCategory}
          />
        </Modal>
      )}
    </div>
  );
}
