"use client";

import z from "zod";
import {
  MAX_QUESTION_COST,
  MIN_QUESTION_COST,
} from "../../points/lib/constants";
import { useRouter } from "next/navigation";
import { useSubjects } from "../hooks/useSubjects";
import { useCategories } from "../hooks/useCategories";
import { startTransition, useActionState, useEffect, useState } from "react";
import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { emptyDoc } from "@/src/lib/editor/json";
import { createQuestionAction } from "../actions/createQuestion";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/src/components/form/FormField";
import { Input } from "@/src/components/form/Input";
import { RichTextEditor } from "@/src/components/editor/RichTextEditor";
import { Select } from "@/src/components/form/Select";
import { PointsCostPicker } from "./PointsCostPicker";
import { Button } from "@/src/components/ui/Button";
import { CategoryPicker } from "./CategoryPicker";
import { useUpdateQuestion } from "../hooks/useUpdateQuestion";

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "Title must be at least 10 characters")
    .max(150, "Title must be 150 characters or fewer"),
  subjectId: z.uuid({ message: "Please pick a subject" }),
  categoryIds: z
    .array(z.uuid())
    .min(1, "Pick at least one category")
    .max(3, "You can pick up to 3 categories"),
  pointsCost: z
    .number()
    .int("Points must be a whole number")
    .min(MIN_QUESTION_COST, `Minimum is ${MIN_QUESTION_COST} points`)
    .max(MAX_QUESTION_COST, `Maximum is ${MAX_QUESTION_COST} points`),
  content: z.string().refine(
    (val) => {
      try {
        return JSON.stringify(JSON.parse(val)) !== JSON.stringify(emptyDoc());
      } catch {
        return false;
      }
    },
    { message: "Please add some content to your question" },
  ),
});

type FormValues = z.output<typeof formSchema>;

interface QuestionFormProps {
  pointsBalance?: number;
  initialData?: {
    questionId: string;
    title: string;
    content: ProseMirrorDoc;
    subjectId: string;
    categoryIds: string[];
    pointsCost: number;
  };
  onSuccess?: (questionId: string) => void;
}

export function QuestionForm({
  pointsBalance = 20,
  initialData,
  onSuccess,
}: QuestionFormProps) {
  const router = useRouter();
  const { subjects, isLoadingSubjects } = useSubjects();
  const { categories, isLoadingCategories } = useCategories();

  const [content, setContent] = useState<ProseMirrorDoc>(
    initialData?.content ?? emptyDoc(),
  );

  const { isUpdatingQuestion, updateQuestion } = useUpdateQuestion();

  const [actionState, formAction, isSubmitting] = useActionState(
    createQuestionAction,
    { ok: null },
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting: rhfSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          subjectId: initialData.subjectId,
          categoryIds: initialData.categoryIds,
          pointsCost: initialData.pointsCost,
          content: JSON.stringify(initialData.content.content),
        }
      : {
          title: "",
          subjectId: "",
          categoryIds: [],
          pointsCost: 20,
          content: JSON.stringify(emptyDoc()),
        },
  });

  const watchedCost = watch("pointsCost");
  const canAfford = pointsBalance >= watchedCost;

  useEffect(() => {
    if (actionState && actionState.ok === true) {
      router.push(`/questions/${actionState.questionId}`);
    }
  }, [actionState, router]);

  async function onSubmit(data: FormValues) {
    if (isEdit && initialData) {
      try {
        await updateQuestion({
          questionId: initialData.questionId,
          title: data.title,
          content: JSON.parse(data.content),
          subjectId: data.subjectId,
          categoryIds: data.categoryIds,
        });
        onSuccess?.(initialData.questionId);
      } catch {}
      return;
    }

    const formData = new FormData();
    formData.set("title", data.title);
    formData.set("subjectId", data.subjectId);
    formData.set("content", data.content);
    formData.set("pointsCost", String(data.pointsCost));
    data.categoryIds.forEach((id) => formData.append("categoryIds", id));

    startTransition(() => {
      formAction(formData);
    });
  }
  const isSubmittingForm = isSubmitting || rhfSubmitting || isUpdatingQuestion;
  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        label="Title"
        required
        error={errors.title?.message}
        message="A clear, specific title helps people find your question"
      >
        <Input
          {...register("title")}
          placeholder="e.g. Why does my Next.js build fail on Windows?"
          disabled={isSubmittingForm}
          error={!!errors.title}
          autoComplete="off"
          maxLength={150}
        />
      </FormField>
      <FormField label="Question details" required>
        <RichTextEditor
          value={content}
          onChange={(doc) => {
            setContent(doc);
            setValue("content", JSON.stringify(doc), { shouldValidate: false });
          }}
          placeholder="Share context, what you've tried, and what you expected to happen…"
          minHeight={260}
          editable={!isSubmittingForm}
        />
        {/* Hidden input sends the content along with the form submission */}
        <input type="hidden" {...register("content")} />
      </FormField>
      <FormField
        label="Subject"
        required
        error={errors.subjectId?.message}
        message="The broad topic area this question belongs to"
      >
        <Select
          {...register("subjectId")}
          options={[
            {
              label: isLoadingSubjects ? "Loading subjects…" : "Pick a subject",
              value: "",
            },
            ...subjects.map((s) => ({
              label: s.name,
              value: s.id,
            })),
          ]}
          disabled={isSubmittingForm || isLoadingSubjects}
          error={!!errors.subjectId}
        />
      </FormField>
      <FormField
        label="Categories"
        required
        error={errors.categoryIds?.message}
        message="Up to 3 — helps route your question to the right experts"
      >
        <Controller
          control={control}
          name="categoryIds"
          render={({ field }) => (
            <CategoryPicker
              categories={categories}
              loading={isLoadingCategories}
              selected={field.value}
              onChange={field.onChange}
              disabled={isSubmittingForm}
            />
          )}
        />
        {watch("categoryIds").map((id) => (
          <input key={id} type="hidden" name="categoryIds" value={id} />
        ))}
      </FormField>
      <FormField
        label="Points to spend"
        required
        error={errors.pointsCost?.message}
      >
        <Controller
          control={control}
          name="pointsCost"
          render={({ field }) => (
            <PointsCostPicker
              value={field.value}
              onChange={field.onChange}
              balance={pointsBalance}
              disabled={isSubmittingForm || isEdit}
              error={errors.pointsCost?.message}
            />
          )}
        />
        {/* Hidden input to ensure pointsCost lands in FormData */}
        <input type="hidden" name="pointsCost" value={watch("pointsCost")} />
      </FormField>

      {/* Server error */}
      {actionState && actionState.ok === false && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm font-medium text-destructive">
            {actionState.error}
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmittingForm}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmittingForm}
          disabled={isSubmittingForm || !canAfford}
        >
          {canAfford
            ? `Ask question (${watchedCost} pts)`
            : `Not enough points (need ${watchedCost - pointsBalance} more)`}
        </Button>
      </div>
    </form>
  );
}
