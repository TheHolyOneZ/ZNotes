import { useState } from "react";
import type { KeyboardEvent } from "react";

export function useTagInput(initial: string[] = []) {
  const [tags, setTags] = useState<string[]>(initial);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((p) => p.filter((x) => x !== tag));

  const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
    if (e.key === "Backspace" && !tagInput && tags.length) setTags((t) => t.slice(0, -1));
  };

  const reset = (newTags: string[] = []) => {
    setTags(newTags);
    setTagInput("");
  };

  return { tags, tagInput, setTagInput, addTag, removeTag, handleTagKey, reset };
}
