import { useEffect, useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { Editor3D } from "../components/Editor3D/Editor3D";
import { LayerControl } from "../components/Sidebar/LayerControl";
import { DeviceProperties } from "../components/Sidebar/DeviceProperties";
import { useDevices } from "../hooks/useDevices";
import { useCables } from "../hooks/useCables";
import { useEditorStore } from "../stores/useEditorStore";

interface Floor {
  id: string;
  name: string;
  floorLevel: number;
}

interface BuildingWithFloors {
  id: string;
  name: string;
  floors: Floor[];
}

interface FloorOption extends Floor {
  buildingName: string;
}

const MODE_OPTIONS = [
  { value: "select", label: "Seleccionar" },
  { value: "move", label: "Mover" },
  { value: "rotate", label: "Rotar" },
  { value: "cable", label: "Cable" },
] as const;

export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const {
    mode,
    setMode,
    activeFloorId,
    setActiveFloor,
    selectedDeviceId,
    selectDevice,
  } = useEditorStore();

  const floorsQuery = useQuery<BuildingWithFloors[]>({
    queryKey: ["project-floors", projectId],
    enabled: Boolean(projectId),
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/floors`);
      return Array.isArray(data) ? (data as BuildingWithFloors[]) : [];
    },
  });

  const floorOptions = useMemo<FloorOption[]>(() => {
    const buildings = floorsQuery.data ?? [];
    return buildings.flatMap((building) =>
      (building.floors ?? []).map((floor) => ({
        ...floor,
        buildingName: building.name,
      })),
    );
  }, [floorsQuery.data]);

  useEffect(() => {
    if (
      activeFloorId &&
      floorOptions.length > 0 &&
      !floorOptions.some((floor) => floor.id === activeFloorId)
    ) {
      setActiveFloor(floorOptions[0].id);
      selectDevice(null);
    }
  }, [activeFloorId, floorOptions, setActiveFloor, selectDevice]);

  const { devices, isLoadingDevices, devicesError } = useDevices(
    projectId,
    activeFloorId ?? undefined,
  );

  const { cables, isLoadingCables, cablesError } = useCables(
    projectId,
    activeFloorId ?? undefined,
  );

  const selectedDevice = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) ?? null,
    [devices, selectedDeviceId],
  );

  useEffect(() => {
    if (
      selectedDeviceId &&
      !devices.some((device) => device.id === selectedDeviceId)
    ) {
      selectDevice(null);
    }
  }, [devices, selectedDeviceId, selectDevice]);

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
              Editor de Red
            </p>
            <h1 className="text-xl font-semibold">Proyecto {projectId}</h1>
          </div>

          <Link
            to={"/projects"}
            className="rounded-mb border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
          >
            Volver a proyectos
          </Link>
        </header>

        <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(280px,360px)_1fr]">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-neutral-600">Planta activa</span>
              <select
                value={activeFloorId ?? ""}
                onChange={(event) => {
                  setActiveFloor(event.target.value);
                  selectDevice(null);
                }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                {floorOptions.length === 0 && (
                  <option value="">Sin plantas</option>
                )}
                {floorOptions.map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {floor.buildingName} - {floor.name} (nivel{" "}
                    {floor.floorLevel})
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-end gap-2">
              {MODE_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    mode === item.value
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-600">
            <span>Equipos: {devices.length}</span>
            <span>Cables: {cables.length}</span>
            {isLoadingDevices && <span>Cargando equipos...</span>}
            {isLoadingCables && <span>Cargando cables...</span>}
            {devicesError && (
              <span className="text-red-600">Error al cargar los equipos</span>
            )}
            {cablesError && (
              <span className="text-red-600">Error al cargar los cables</span>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="h-[68vh]">
              <Editor3D />
            </div>
          </section>

          <aside className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <LayerControl />

            <section className="border-t p-4">
              <h2 className="mb-2 text-sm font-semibold">Dispositivos</h2>
              <div className="max-h-44 overflow-auto space-y-1">
                {devices.length === 0 ? (
                  <p className="text-xs text-neutral-500">
                    No hay dispositivos en esta planta.
                  </p>
                ) : (
                  devices.map((device) => (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => selectDevice(device.id)}
                      className={`w-full rounded-md border px-2 py-1 text-left text-sm ${
                        selectedDeviceId === device.id
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      {device.name}
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="border-t p-4">
              <h2 className="mb-2 text-sm font-semibold">Cables</h2>
              <div className="max-h-28 overflow-auto space-y-1 text-xs text-neutral-600">
                {cables.length === 0 ? (
                  <p>No hay cables en esta planta.</p>
                ) : (
                  cables.map((cable) => (
                    <p key={cable.id}>
                      {cable.fromDeviceId.slice(0, 6)} -{" "}
                      {cable.toDeviceId.slice(0, 6)}{" "}
                      {cable.vlan ? `(VLAN ${cable.vlan})` : ""}
                    </p>
                  ))
                )}
              </div>
            </section>

            <section className="border-t">
              {selectedDevice ? (
                <DeviceProperties device={selectedDevice} />
              ) : (
                <p className="p-4 text-sm text-neutral-500">
                  Selecciona un dispositivo para editar sus propiedades.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
