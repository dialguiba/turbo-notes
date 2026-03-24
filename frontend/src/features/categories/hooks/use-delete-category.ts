import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useCategoryFilter } from "@/features/categories/hooks/use-category-filter";
import type { Category } from "@/features/categories/types";

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { setCategory } = useCategoryFilter();

  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/categories/${id}/`),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const previous = queryClient.getQueryData<Category[]>(["categories"]);

      queryClient.setQueryData<Category[]>(["categories"], (old) =>
        old?.filter((cat) => cat.id !== id),
      );

      // Read active filter from URL at mutation time, not hook call time
      const params = new URLSearchParams(window.location.search);
      if (params.get("category") === String(id)) {
        setCategory(null);
      }

      return { previous };
    },

    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["categories"], context.previous);
      }
      toast.error("Failed to delete category");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
