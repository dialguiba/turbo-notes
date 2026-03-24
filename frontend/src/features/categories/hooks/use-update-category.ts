import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { Category } from "@/features/categories/types";

interface UpdateCategoryPayload {
  name?: string;
  color?: string;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: UpdateCategoryPayload & { id: number }) =>
      apiClient.patch<Category>(`/api/categories/${id}/`, payload),

    onMutate: async ({ id, ...payload }) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const previous = queryClient.getQueryData<Category[]>(["categories"]);

      queryClient.setQueryData<Category[]>(["categories"], (old) =>
        old?.map((cat) => (cat.id === id ? { ...cat, ...payload } : cat)),
      );

      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["categories"], context.previous);
      }
      toast.error("Failed to update category");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
