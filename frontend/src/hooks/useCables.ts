import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export type CableType = "CAT6" | "CAT6A" | "FIBER" | "COAX";

export interface PathPoint {
  x: number;
  y: number;
}

export interface Cable {
  id: string;
  floorId: string;
  fromDeviceId: string;
  toDeviceId: string;
  cableType: CableType;
  vlan?: number | null;
  pathPoints?: PathPoint[] | null;
  label?: string | null;
}

export interface CreateCableInput {
  fromDeviceId: string;
  toDeviceId: string;
  cableType?: CableType;
  vlan?: number;
  pathPoints?: PathPoint[];
  label?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseCableList(payload: unknown): Cable[] {
  if (Array.isArray(payload)) return payload as Cable[];
  if (isRecord(payload)) {
    if (Array.isArray(payload.items)) return payload.items as Cable[];
    if (Array.isArray(payload.cables)) return payload.cables as Cable[];
  }
  return [];
}

function requireIds(
  projectId?: string,
  floorId?: string,
): { projectId: string; floorId: string } {
  if (!projectId || !floorId) {
    throw new Error("projectId y floorId son obligatorios");
  }
  return { projectId, floorId };
}

export function useCables(projectId?: string, floorId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["cables", projectId, floorId] as const;
  const enabled = Boolean(projectId && floorId);

  const cablesQuery = useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const ids = requireIds(projectId, floorId);
      const { data } = await api.get(
        `/projects/${ids.projectId}/floors/${ids.floorId}/cables`,
      );
      return parseCableList(data);
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey,
    });

  const createCableMutation = useMutation({
    mutationFn: async (payload: CreateCableInput) => {
      const ids = requireIds(projectId, floorId);
      const { data } = await api.post(
        `/projects/${ids.projectId}/floors/${ids.floorId}/cables`,
        payload,
      );
      return data;
    },
    onSuccess: invalidate,
  });

  const deleteCableMutation = useMutation({
    mutationFn: async (cableId: string) => {
      await api.delete(`/cables/${cableId}`);
      return cableId;
    },
    onSuccess: invalidate,
  });

  return {
    cables: cablesQuery.data ?? [],
    isLoadingCables: cablesQuery.isLoading,
    isFetchingCables: cablesQuery.isFetching,
    cablesError: cablesQuery.error,
    refetchCables: cablesQuery.refetch,

    createCable: createCableMutation.mutateAsync,
    deleteCable: deleteCableMutation.mutateAsync,

    isCreatingCable: createCableMutation.isPending,
    isDeletingCable: deleteCableMutation.isPending,
  };
}
