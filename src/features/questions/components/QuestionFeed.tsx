"use client";

import { useEffect, useMemo, useState } from "react";
import { FeedFilters, FeedFilterState } from "./FeedFilters";
import { useQuestions } from "../hooks/useQuestions";
import { Button } from "@/src/components/ui/Button";
import Link from "next/link";
import { Inbox, Plus } from "lucide-react";
import { QuestionCard } from "./QuestionCard";
import { Modal } from "@/src/components/ui/Modal/Modal";
import { useModal } from "@/src/components/ui/Modal/useModal";
import { QuestionForm } from "./QuestionForm";
import { ProfileDto } from "../../public/types/profileDto";

const EMPTY_FILTERS: FeedFilterState = {
  subjectId: "",
  categoryId: "",
  query: "",
};

const FeedSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="rounded-lg border border-border bg-card p-4 animate-pulse"
      >
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="mt-2 h-3 w-full rounded bg-muted" />
        <div className="mt-1 h-3 w-2/3 rounded bg-muted" />
      </div>
    ))}
  </div>
);

const EmptyState = ({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
    <Inbox className="h-10 w-10 text-muted-foreground" />
    <h3 className="mt-4 text-base font-semibold text-foreground">
      {hasFilters ? "No questions match your filters" : "No questions yet"}
    </h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
      {hasFilters
        ? "Try clearing the filters or searching with different keywords."
        : "Be the first to ask a question — the community is waiting."}
    </p>
    {hasFilters ? (
      <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
        Clear filters
      </Button>
    ) : (
      <Button size="sm" icon={Plus}>
        Ask the first question
      </Button>
    )}
  </div>
);

export function QuestionFeed({ pointsBalance }: { pointsBalance: number }) {
  const [filters, setFilters] = useState<FeedFilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const [debouncedQuery, setDebouncedQuery] = useState("");

  //   Debounce the search input by 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(filters.query.trim()), 300);
    return () => clearTimeout(t);
  }, [filters.query]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.subjectId, filters.categoryId, debouncedQuery]);

  // Compose API params, omitting empty strings (which would fail uuid validation)
  const params = useMemo(() => {
    const p: {
      subjectId?: string;
      categoryId?: string;
      q?: string;
      page: number;
    } = { page };
    if (filters.subjectId) p.subjectId = filters.subjectId;
    if (filters.categoryId) p.categoryId = filters.categoryId;
    if (debouncedQuery) p.q = debouncedQuery;
    return p;
  }, [filters.subjectId, filters.categoryId, debouncedQuery, page]);

  const { questions, pagination, isLoadingQuestions, isFetchingQuestions } =
    useQuestions(params);

  const questionFormModal = useModal();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination.total > 0
              ? `${pagination.total} open question${pagination.total === 1 ? "" : "s"}`
              : "No questions yet"}
          </p>
        </div>
        <Button icon={Plus} onClick={questionFormModal.openModal}>
          Ask question
        </Button>
      </div>

      {/* Filters */}
      <FeedFilters value={filters} onChange={setFilters} />

      {/* List */}
      {isLoadingQuestions ? (
        <FeedSkeleton />
      ) : questions.length === 0 ? (
        <EmptyState
          hasFilters={
            filters.subjectId !== "" ||
            filters.categoryId !== "" ||
            debouncedQuery !== ""
          }
          onClear={() => setFilters(EMPTY_FILTERS)}
        />
      ) : (
        <div
          className={`space-y-3 transition-opacity ${
            isFetchingQuestions ? "opacity-60" : "opacity-100"
          }`}
        >
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
          <span className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isFetchingQuestions}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                pagination.page >= pagination.totalPages || isFetchingQuestions
              }
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      <Modal
        open={questionFormModal.open}
        onClose={questionFormModal.closeModal}
        title="Ask Question"
      >
        <div className="p-10 w-full md:w-7xl">
          <QuestionForm pointsBalance={pointsBalance} />
        </div>
      </Modal>
    </div>
  );
}
