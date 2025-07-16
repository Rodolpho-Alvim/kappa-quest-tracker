import { useLocalStorage } from "./use-local-storage";

const STORAGE_KEY = "kappa-hideout-progress";

export function useHideoutProgress() {
  const [progress, setProgress] = useLocalStorage<Record<string, number>>(
    STORAGE_KEY,
    {}
  );

  function setItemProgress(itemId: string, value: number) {
    setProgress((prev) => ({ ...prev, [itemId]: value }));
  }

  function resetProgress() {
    setProgress({});
  }

  return { progress, setItemProgress, resetProgress };
}
