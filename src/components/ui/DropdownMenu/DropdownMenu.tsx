"use client";

import React, { useId, useState } from "react";
import { DropdownContextProvider } from "./useDropdown";

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  const id = useId();

  const triggerId = `${id}-trigger`;
  const contentId = `${id}-content`;

  return (
    <DropdownContextProvider value={{ open, setOpen, triggerId, contentId }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContextProvider>
  );
};
