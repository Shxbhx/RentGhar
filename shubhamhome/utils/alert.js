import { Platform, Alert } from 'react-native';

export const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  if (Platform.OS === 'web') {
    // Web alert
    if (buttons.length === 1) {
      // Simple alert
      window.alert(`${title}\n${message}`);
    } else {
      // Confirmation dialog
      const result = window.confirm(`${title}\n${message}`);
      if (result) {
        // User clicked OK/Yes
        const confirmButton = buttons.find(btn => btn.style === 'destructive' || btn.style === 'default');
        confirmButton?.onPress?.();
      } else {
        // User clicked Cancel
        const cancelButton = buttons.find(btn => btn.style === 'cancel');
        cancelButton?.onPress?.();
      }
    }
  } else {
    // Mobile alert
    Alert.alert(title, message, buttons);
  }
};