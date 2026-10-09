"use client";

import { useAlert } from "@/src/components/alert/useAlert";
import { useConfirm } from "@/src/components/confirm/useConfirm";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal/Modal";
import { useModal } from "@/src/components/ui/Modal/useModal";
import { Subject } from "@/src/db/schema";
import { SubjectForm } from "@/src/features/admin/components/subjects/SubjectForm";
import { SubjectsTable } from "@/src/features/admin/components/subjects/SubjectTable";
import { useSubjects } from "@/src/features/admin/hooks/useSubjects";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

export default function SubjectsPage() {
  const { subjects, isLoadingSubjects, deleteSubject, isDeletingSubject } =
    useSubjects();
  const addSubjectModal = useModal();
  const editSubjectModal = useModal();

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const confirm = useConfirm();
  const alert = useAlert();

  const handleDelete = async (subject: Subject) => {
    const ok = await confirm("Are you sure you want to delete this subject?");
    if (!ok) return;
    await deleteSubject(subject.id);
    alert.success("Subject deleted successfully");
  };

  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex justify-between w-full">
        <h1>Subjects</h1>
        <Button
          variant="secondary"
          icon={PlusIcon}
          onClick={() => addSubjectModal.openModal()}
        >
          Add Subject
        </Button>
      </div>
      <SubjectsTable
        data={subjects}
        isLoading={isLoadingSubjects}
        onEdit={(subject) => {
          setSelectedSubject(subject);
          editSubjectModal.openModal();
        }}
        onDelete={handleDelete}
      />
      <Modal
        open={addSubjectModal.open}
        onClose={addSubjectModal.closeModal}
        title="Add subject"
      >
        <SubjectForm onSuccess={addSubjectModal.closeModal} />
      </Modal>

      {selectedSubject && (
        <Modal
          {...editSubjectModal}
          onClose={editSubjectModal.closeModal}
          title="Update Subject"
        >
          <SubjectForm
            onSuccess={() => {
              editSubjectModal.closeModal();
              setSelectedSubject(null);
            }}
            editingSubject={selectedSubject}
          />
        </Modal>
      )}
    </div>
  );
}
