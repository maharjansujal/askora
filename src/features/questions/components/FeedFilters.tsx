"use client";

import { useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/src/components/form/Input";
import { Select } from "@/src/components/form/Select";
import { useSubjects } from "../hooks/useSubjects";
import { useCategories } from "../hooks/useCategories";

export interface FeedFilterState {
  subjectId: string;
  categoryId: string;
  query: string;
}

interface FeedFiltersProps {
  value: FeedFilterState;
  onChange: (next: FeedFilterState) => void;
}

export const FeedFilters = ({ value, onChange }: FeedFiltersProps) => {
  const { subjects, isLoadingSubjects } = useSubjects();
  const { categories, isLoadingCategories } = useCategories();

  const subjectOptions = useMemo(
    () => [
      {
        value: "",
        label: isLoadingSubjects ? "Loading subjects…" : "All subjects",
      },
      ...subjects.map((s) => ({ value: s.id, label: s.name })),
    ],
    [subjects, isLoadingSubjects],
  );

  const categoryOptions = useMemo(
    () => [
      {
        value: "",
        label: isLoadingCategories ? "Loading categories…" : "All categories",
      },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories, isLoadingCategories],
  );

  const update = useCallback(
    (patch: Partial<FeedFilterState>) => {
      onChange({ ...value, ...patch });
    },
    [onChange, value],
  );

  const hasActiveFilters =
    value.subjectId !== "" || value.categoryId !== "" || value.query !== "";

  const clearAll = () => onChange({ subjectId: "", categoryId: "", query: "" });

  return (
    <div className="space-y-3">
      {/* Search + clear */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value.query}
            onChange={(e) => update({ query: e.target.value })}
            placeholder="Search question titles…"
            className="pl-9"
            maxLength={200}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Subject + category dropdowns */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Select
            value={value.subjectId}
            onChange={(e) => update({ subjectId: e.target.value })}
            options={subjectOptions}
          />
        </div>
        <div className="flex-1">
          <Select
            value={value.categoryId}
            onChange={(e) => update({ categoryId: e.target.value })}
            options={categoryOptions}
          />
        </div>
      </div>
    </div>
  );
};
