import React, { ReactNode, useEffect, useState } from "react";
import { ThemedAlertAPI } from "../lib/themedAlert";
import { ThemedAlert } from "./ThemedAlert";

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
  icon?: string;
  type?: "default" | "success" | "error" | "warning" | "info";
}

interface ThemedAlertProviderProps {
  children: ReactNode;
}

export function ThemedAlertProvider({ children }: ThemedAlertProviderProps) {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: "",
  });

  useEffect(() => {
    // Register the showAlert function with the manager
    ThemedAlertAPI.setShowAlert((props) => {
      setAlertState({
        visible: true,
        ...props,
      });
    });
  }, []);

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <>
      {children}
      <ThemedAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        icon={alertState.icon as any}
        type={alertState.type}
        onClose={hideAlert}
      />
    </>
  );
}
