import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/app/_components/ui/button";
import AnkiIcon from "@/app/_components/ankiIcon";

function AnkiButton({
  blockIdx,
  wordIdx,
  onAddWordToAnki,
  onCanAddWordsToAnki,
}: {
  blockIdx: number;
  wordIdx: number;
  onAddWordToAnki: (blockIdx: number, wordIdx: number) => Promise<void>;
  onCanAddWordsToAnki: (blockIdx: number) => Promise<boolean[]>;
}) {
  const queryKey = ["canAddWordsToAnki", blockIdx] as const;
  const {
    data: canAddWordsToAnkiList,
    error,
    isPending: isCanAddWordsToAnkiPending,
  } = useQuery({
    queryFn: () => onCanAddWordsToAnki(blockIdx),
    queryKey: queryKey,
    enabled: blockIdx !== null,
  });
  const queryClient = useQueryClient();
  const { mutate: addWordToAnki, isPending: isAddWordPending } = useMutation({
    mutationFn: () => onAddWordToAnki(blockIdx, wordIdx),
    // Optimistically update cache to set the word as added to Anki, to prevent flashing when re-fetching
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousList = queryClient.getQueryData(queryKey)!;
      queryClient.setQueryData(queryKey, (old: boolean[]) =>
        Object.assign([...old], { [wordIdx]: false }),
      );
      return { previousList };
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const canAddWordToAnki = canAddWordsToAnkiList?.[wordIdx];

  if (error) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      className="absolute right-1 top-1 h-14 w-14 p-2"
      disabled={
        isCanAddWordsToAnkiPending || isAddWordPending || !canAddWordToAnki
      }
      onClick={() => addWordToAnki()}
    >
      <AnkiIcon className="h-7 w-7 fill-current text-muted-foreground" />
    </Button>
  );
}

export default AnkiButton;
