import { useEditorStore } from "../../stores/useEditorStore";

export function LayerControl() {
  const { layers, toggleLayer } = useEditorStore();

  const items = [
    { key: "cabling" as const, label: "Cableado" },
    { key: "devices" as const, label: "Equipos" },
    { key: "racks" as const, label: "Racks" },
  ];

  return (
    <div className="p-4 border-t">
      <h3 className="font-bold mb-2 text-xs uppercase tracking-wider text-gray-500">
        Mostrar capas
      </h3>
      {items.map(({ key, label }) => (
        <label
          key={key}
          className="flex items-center gap-2 mb-1 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={() => toggleLayer(key)}
            className="accent-custom-blue"
          />
          <span className="text-sm">{label}</span>
        </label>
      ))}
    </div>
  );
}
