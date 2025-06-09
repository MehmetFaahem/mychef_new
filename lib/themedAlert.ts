interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertOptions {
  icon?: string;
  type?: "default" | "success" | "error" | "warning" | "info";
}

class ThemedAlertManager {
  private static instance: ThemedAlertManager;
  private showAlert: ((props: any) => void) | null = null;

  static getInstance(): ThemedAlertManager {
    if (!ThemedAlertManager.instance) {
      ThemedAlertManager.instance = new ThemedAlertManager();
    }
    return ThemedAlertManager.instance;
  }

  setShowAlert(showAlert: (props: any) => void) {
    this.showAlert = showAlert;
  }

  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) {
    if (!this.showAlert) {
      console.warn(
        "ThemedAlert not initialized. Make sure to add ThemedAlertProvider to your app."
      );
      return;
    }

    this.showAlert({
      title,
      message,
      buttons: buttons || [{ text: "OK", style: "default" }],
      icon: options?.icon,
      type: options?.type || "default",
    });
  }

  success(title: string, message?: string, buttons?: AlertButton[]) {
    this.alert(title, message, buttons, { type: "success" });
  }

  error(title: string, message?: string, buttons?: AlertButton[]) {
    this.alert(title, message, buttons, { type: "error" });
  }

  warning(title: string, message?: string, buttons?: AlertButton[]) {
    this.alert(title, message, buttons, { type: "warning" });
  }

  info(title: string, message?: string, buttons?: AlertButton[]) {
    this.alert(title, message, buttons, { type: "info" });
  }

  confirm(
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText: string = "Confirm",
    cancelText: string = "Cancel"
  ) {
    this.alert(title, message, [
      { text: cancelText, style: "cancel", onPress: onCancel },
      { text: confirmText, style: "default", onPress: onConfirm },
    ]);
  }

  destructive(
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText: string = "Delete",
    cancelText: string = "Cancel"
  ) {
    this.alert(
      title,
      message,
      [
        { text: cancelText, style: "cancel", onPress: onCancel },
        { text: confirmText, style: "destructive", onPress: onConfirm },
      ],
      { type: "error" }
    );
  }
}

export const ThemedAlertAPI = ThemedAlertManager.getInstance();
