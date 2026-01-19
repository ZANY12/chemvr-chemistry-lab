import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertExperiment } from "@shared/schema";

export function useExperiments() {
  return useQuery({
    queryKey: [api.experiments.list.path],
    queryFn: async () => {
      const res = await fetch(api.experiments.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch experiments");
      return api.experiments.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertExperiment) => {
      const validated = api.experiments.create.input.parse(data);
      const res = await fetch(api.experiments.create.path, {
        method: api.experiments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create experiment");
      return api.experiments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.experiments.list.path] });
    },
  });
}
