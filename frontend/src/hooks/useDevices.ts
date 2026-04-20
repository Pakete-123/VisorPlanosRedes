import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
export type DeviceState = "ACTIVE" | "RESERVE" | "BROKEN";
export interface Device {
  id: string;
  floorId: string;
  name: string;
  type: string;
  ip?: string | null;
  mac?: string | null;
  vlan?: number | null;
  switchPort?: number | null;
  state: DeviceState;
  notes?: string | null;
  posX: number;
  posY: number;
  posZ: number;
  rotation: number;
}
export interface CreateDeviceInput {
  name: string;
  type: string;
  ip?: string;
  mac?: string;
  vlan?: number;
  switchPort?: number;
  state?: DeviceState;
  notes?: string;
  posX: number;
  posY: number;
  posZ: number;
  rotation?: number;
}
export interface UpdateDeviceInput {
  deviceId: string;
  data: Partial<Omit<Device, "id" | "floorId">>;
}
export interface MoveDeviceInput {
  deviceId: string;
  posX: number;
  posY: number;
  posZ: number;
  rotation?: number;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function parseDeviceList(payload: unknown): Device[] {
  if (Array.isArray(payload)) return payload as Device[];
  if (isRecord(payload)) {
    if (Array.isArray(payload.items)) return payload.items as Device[];
    if (Array.isArray(payload.devices)) return payload.devices as Device[];
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
export function useDevices(projectId?: string, floorId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["devices", projectId, floorId] as const;
  const enabled = Boolean(projectId && floorId);
  const devicesQuery = useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const ids = requireIds(projectId, floorId);
      const { data } = await api.get(
        `/projects/${ids.projectId}/floors/${ids.floorId}/devices`,
      );
      return parseDeviceList(data);
    },
  });
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey,
    });
  const createDeviceMutation = useMutation({
    mutationFn: async (payload: CreateDeviceInput) => {
      const ids = requireIds(projectId, floorId);
      const { data } = await api.post<Device>(
        `/projects/${ids.projectId}/floors/${ids.floorId}/devices`,
        payload,
      );
      return data;
    },
    onSuccess: invalidate,
  });
  const moveDeviceMutation = useMutation({
    mutationFn: async ({
      deviceId,
      posX,
      posY,
      posZ,
      rotation,
    }: MoveDeviceInput) => {
      const response = await api.patch<Device>(
        `/devices/${deviceId}/position`,
        {
          posX,
          posY,
          posZ,
          rotation,
        },
      );
      return response.data;
    },
    onSuccess: invalidate,
  });
  const updateDeviceMutation = useMutation({
    mutationFn: async ({ deviceId, data }: UpdateDeviceInput) => {
      const response = await api.patch<Device>(`/devices/${deviceId}`, data);
      return response.data;
    },
    onSuccess: invalidate,
  });
  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      await api.delete(`/devices/${deviceId}`);
      return deviceId;
    },
    onSuccess: invalidate,
  });
  return {
    devices: devicesQuery.data ?? [],
    isLoadingDevices: devicesQuery.isLoading,
    isFetchingDevices: devicesQuery.isFetching,
    devicesError: devicesQuery.error,
    refetchDevices: devicesQuery.refetch,
    createDevice: createDeviceMutation.mutateAsync,
    updateDevice: updateDeviceMutation.mutateAsync,
    moveDevice: moveDeviceMutation.mutateAsync,
    deleteDevice: deleteDeviceMutation.mutateAsync,
    isCreatingDevice: createDeviceMutation.isPending,
    isUpdatingDevice: updateDeviceMutation.isPending,
    isMovingDevice: moveDeviceMutation.isPending,
    isDeletingDevice: deleteDeviceMutation.isPending,
  };
}
