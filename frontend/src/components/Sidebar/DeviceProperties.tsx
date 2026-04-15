import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";

interface Device {
  id: string;
  name: string;
  ip?: string;
  mac?: string;
  vlan?: number;
  switchPort?: number;
  state: "ACTIVE" | "RESERVE" | "BROKEN";
  notes?: string;
}

export function DeviceProperties({ device }: { device: Device }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<Device>({ defaultValues: device });

  const update = useMutation({
    mutationFn: (data: Partial<Device>) =>
      api.patch(`/devices/${device.id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["devices"] }),
  });

  return (
    <form
      onSubmit={handleSubmit((d) => update.mutate(d))}
      className="flex flex-col gap-3 p-4 text-sm"
    >
      <h2 className="font-bold text-base text-custom-blue">Editar Dispositivo</h2>

      <label className="font-medium">Nombre</label>
      <input {...register("name")} className="border rounded px-2 py-1" />

      <label className="font-medium">IP</label>
      <input
        {...register("ip")}
        placeholder="192.168.1.x"
        className="border rounded px-2 py-1"
      />

      <label className="font-medium">MAC</label>
      <input
        {...register("mac")}
        placeholder="00:1A:2B:3C:4D:5E"
        className="border rounded px-2 py-1"
      />

      <label className="font-medium">VLAN</label>
      <input
        {...register("vlan", { valueAsNumber: true })}
        type="number"
        min={1}
        max={4094}
        className="border rounded px-2 py-1"
      />

      <label className="font-medium">Puerto Switch</label>
      <input
        {...register("switchPort", { valueAsNumber: true })}
        type="number"
        min={1}
        max={48}
        className="border rounded px-2 py-1"
      />

      <label className="font-medium">Estado</label>
      <select {...register("state")} className="border rounded px-2 py-1">
        <option value="ACTIVE">Activo</option>
        <option value="RESERVE">Reserva</option>
        <option value="BROKEN">Averiado</option>
      </select>

      <label className="font-medium">Observaciones</label>
      <textarea
        {...register("notes")}
        rows={3}
        className="border rounded px-2 py-1 resize-none"
      />

      <button
        type="submit"
        className="bg-custom-blue text-white rounded py-1.5 font-medium hover:bg-blue-700 transition mt-1"
      >
        Guardar cambios
      </button>
    </form>
  );
}
