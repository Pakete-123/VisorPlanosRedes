import { useAuthStore } from "../stores/useAuthStore";

export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role);
  return {
    canEdit: role === "ADMIN" || role === "EDITOR",
    canDelete: role === "ADMIN",
    canManageUsers: role === "ADMIN",
    canExport: true,
  };
}

// Uso en cualquier componente:
// const { canEdit, canDelete } = usePermissions();
// {canEdit && <button>Editar</button>}
// {canDelete && <button>Eliminar</button>}