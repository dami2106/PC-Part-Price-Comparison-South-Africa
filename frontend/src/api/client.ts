import type { Build, BuildComponent, BuildSummary, CommunityBuild, ProductGroup } from "../types";

// In production, set VITE_API_URL to your deployed backend URL, e.g.:
//   https://your-api.onrender.com
// In development this is empty, so requests go through Vite's proxy to localhost:8000.
const BASE = (import.meta.env.VITE_API_URL ?? "") + "/api";

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

// ---- Private Builds ----

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
    body: JSON.stringify({ name: build.name, components: build.components }),
  });
}

export async function deleteBuild(id: string): Promise<void> {
  await request(`/builds/${id}`, { method: "DELETE" });
}

// ---- Publish ----

export async function publishBuild(
  id: string,
  author: string,
  description: string
): Promise<CommunityBuild> {
  return request<CommunityBuild>(`/builds/${id}/publish`, {
    method: "POST",
    body: JSON.stringify({ author, description }),
  });
}

export async function unpublishBuild(id: string): Promise<void> {
  await request(`/builds/${id}/unpublish`, { method: "POST" });
}

// ---- Community ----

export type CommunitySort = "newest" | "liked" | "price_asc" | "price_desc";

export async function getCommunityBuilds(sort: CommunitySort = "newest"): Promise<CommunityBuild[]> {
  const data = await request<{ builds: CommunityBuild[] }>(`/community?sort=${sort}`);
  return data.builds;
}

export async function likeBuild(id: string): Promise<number> {
  const data = await request<{ likes: number }>(`/community/${id}/like`, { method: "POST" });
  return data.likes;
}

export async function forkBuild(id: string): Promise<Build> {
  return request<Build>(`/community/${id}/fork`, { method: "POST" });
}

export type { Build, BuildComponent, BuildSummary, ProductGroup };
