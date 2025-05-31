import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data to storage
export const saveToStorage = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(`@savvy_${key}`, jsonValue);
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
    throw e;
  }
};

// Load data from storage
export const loadFromStorage = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(`@savvy_${key}`);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    throw e;
  }
};

// Remove data from storage
export const removeFromStorage = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`@savvy_${key}`);
  } catch (e) {
    console.error(`Error removing ${key} from storage:`, e);
    throw e;
  }
};

// Clear all app storage
export const clearStorage = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter(key => key.startsWith('@savvy_'));
    await AsyncStorage.multiRemove(appKeys);
  } catch (e) {
    console.error('Error clearing storage:', e);
    throw e;
  }
};