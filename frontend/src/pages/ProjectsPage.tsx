import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useAuthStore } from "../stores/useAuthStore";

interface Project {
  id: string;
  name: string;
  createdAt?: string;
}

export function ProjectsPage() {
  const [newProjectName, setNewProjectName] = useState("");
  const [search, setSearch] = useState("");
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: projects = [],
    isLoading,
    isError,
  } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get("/projects");
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items as Project[];
      return [];
    },
  });

  const createProject = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post<Project>("/projects", { name });
      return data;
    },
    onSuccess: () => {
      setNewProjectName("");
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(term));
  }, [projects, search]);

  const handleCreateProject = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newProjectName.trim();
    if (!name || createProject.isPending) return;
    createProject.mutate(name);
  };

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Visor de Red
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Proyectos
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {user ? `Sesión: ${user.name}` : "Sin Sesión"}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Cerrar Sesión
          </button>
        </header>

        <section className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={handleCreateProject}
            className="grid gap-3 sm:grid-cols-[1fr_auto]"
          >
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nombre del Proyecto"
              className="rounded-md bg-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            <button
              type="submit"
              disabled={createProject.isPending}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {createProject.isPending ? "Creando..." : "Crear Proyecto"}
            </button>
          </form>

          {createProject.isError && (
            <p className="mt-2 text-sm text-red-600">
              No se pudo crear el proyecto
            </p>
          )}
        </section>

        <section className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proyecto..."
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
        </section>

        {isLoading && (
          <p className="text-sm text-neutral-500">Cargando proyectos...</p>
        )}
        {isError && (
          <p className="text-sm text-red-600">Error cargando proyectos.</p>
        )}

        {!isLoading && !isError && (
          <ul className="grid gap-3">
            {filteredProjects.length === 0 ? (
              <li className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
                No hay proyectos.
              </li>
            ) : (
              filteredProjects.map((project) => (
                <li
                  key={project.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-medium">{project.name}</h2>
                      {project.createdAt && (
                        <p className="mt-1 text-xs text-neutral-500">
                          Creado:{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <Link
                      to={`/projects/${project.id}/editor`}
                      className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Abrir editor
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </main>
  );
}
