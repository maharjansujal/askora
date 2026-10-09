import { createContext, useCallback, useMemo, useRef, useState } from "react";
import { Confirm } from "./Confirm";

type ConfirmOptions = {
  title?: string;
};

type ConfirmState = {
  message: string;
  title: string;
};

type ConfirmFn = (
  message: string,
  options?: ConfirmOptions,
) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((message, options) => {
    if (resolver.current) {
      console.warn("Confirm already open");
      return Promise.resolve(false);
    }

    setState({
      message,
      title: options?.title ?? "Confirm",
    });

    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const cleanup = () => {
    resolver.current = null;
    setState(null);
  };

  const handleClose = () => {
    resolver.current?.(false);
    cleanup();
  };

  const handleConfirm = () => {
    resolver.current?.(true);
    cleanup();
  };

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Confirm
        open={!!state}
        title={state?.title ?? ""}
        message={state?.message ?? ""}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
}
