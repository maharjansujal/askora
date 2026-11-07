"use client";

import { clsx } from "clsx";

interface CategoryPickerProps {
  categories: { id: string; name: string; slug: string }[];
  loading: boolean;
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  max?: number;
}

export function CategoryPicker({
  categories,
  loading,
  selected,
  onChange,
  disabled = false,
  max = 3,
}: CategoryPickerProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading categories…</p>;
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No categories available yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(({ id, name }) => {
        const isSelected = selected.includes(id);
        const atLimit = !isSelected && selected.length >= max;
        const isDisabled = disabled || atLimit;

        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            disabled={isDisabled}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted",
              (atLimit || disabled) && "cursor-not-allowed",
              atLimit && "opacity-40",
            )}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
