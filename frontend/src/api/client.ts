import type { Build, BuildComponent, BuildSummary, ProductGroup } from "../types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

// ---- Categories ----

export async function fetchCategories(): Promise<string[]> {
  const data = await request<{ categories: string[] }>("/categories");
  return data.categories;
}

// ---- Search ----

export async function searchProducts(
  query: string,
  category?: string
): Promise<ProductGroup[]> {
  const params = new URLSearchParams({ query });
  if (category) params.set("category", category);
  const data = await request<{ groups: ProductGroup[] }>(`/search?${params}`);
  return data.groups;
}

// ---- Builds ----

export async function listBuilds(): Promise<BuildSummary[]> {
  const data = await request<{ builds: BuildSummary[] }>("/builds");
  return data.builds;
}

export async function createBuild(name: string): Promise<Build> {
  return request<Build>("/builds", {
    method: "POST",
    body: JSON.stringify({ name, components: {} }),
  });
}

export async function getBuild(id: string): Promise<Build> {
  return request<Build>(`/builds/${id}`);
}

export async function saveBuild(build: Build): Promise<Build> {
  return request<Build>(`/builds/${build.id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: build.name,
      components: build.components,
    }),
  });
}

export async function deleteBuild(id: string): Promise<void> {
  await request(`/builds/${id}`, { method: "DELETE" });
}

export type { Build, BuildComponent, BuildSummary, ProductGroup };
