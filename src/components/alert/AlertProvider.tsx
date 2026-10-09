import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, AlertType } from "./Alert";

type AlertContextType = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

type AlertState = {
  message: string;
  type: AlertType;
};

export const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (removeTimer.current) {
      clearTimeout(removeTimer.current);
      removeTimer.current = null;
    }
  };

  const showAlert = useCallback((message: string, type: AlertType) => {
    clearTimers();

    // Trigger exit first if an alert already exists
    setAlert((prev) => {
      if (prev) {
        // allow exit animation to run before replacing
        setTimeout(() => {
          setAlert({ message, type });
        }, 200); // should match your exit duration

        return null;
      }

      return { message, type };
    });

    removeTimer.current = setTimeout(() => {
      setAlert(null); // triggers exit animation
    }, 2500);
  }, []);

  useEffect(() => {
    return () => clearTimers(); // cleanup on unmount
  }, []);

  const value = useMemo<AlertContextType>(
    () => ({
      success: (m) => showAlert(m, "success"),
      error: (m) => showAlert(m, "error"),
      info: (m) => showAlert(m, "info"),
    }),
    [showAlert],
  );

  return (
    <AlertContext.Provider value={value}>
      {children}

      {alert && <Alert key="alert" message={alert.message} type={alert.type} />}
    </AlertContext.Provider>
  );
}
