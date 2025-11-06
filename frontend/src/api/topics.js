import { authorizedFetch } from "./utils";

const API_URL = import.meta.env.VITE_API_URL;

export async function createTopic(data) {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined)
      formData.append(key, data[key]);
  }

  const response = await authorizedFetch(`${API_URL}/topics/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to create topic: ${err}`);
  }

  return await response.json();
}

export async function createMedia(data) {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined)
      formData.append(key, data[key]);
  }

  const response = await authorizedFetch(`${API_URL}/media/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to upload media: ${err}`);
  }

  return await response.json();
}

export async function fetchTopics() {
  const response = await authorizedFetch(`${API_URL}/topics/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to fetch topics");
  return await response.json();
}
