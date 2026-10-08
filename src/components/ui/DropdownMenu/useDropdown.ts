import { createContext, useContext } from "react";

interface DropdownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export const useDropdown = () => {
  const context = useContext(DropdownContext);

  if (!context)
    throw new Error(
      "DropdownMenu components must be used inside <Dropdownmenu",
    );

  return context;
};

export const DropdownContextProvider = DropdownContext.Provider;
