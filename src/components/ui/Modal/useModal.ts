import { useCallback, useState } from "react";

export type UseModalReturn = {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useModal = (initial = false): UseModalReturn => {
  const [open, setOpen] = useState(initial);

  const openModal = useCallback(() => {
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    openModal,
    closeModal,
  };
};
