const API_URL = import.meta.env.VITE_API_URL;

export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    logoutUser();
    return null;
  }

  const data = await res.json();
  localStorage.setItem("accessToken", data.access);
  return data.access;
}

// Helper to add Authorization and auto-refresh on 401
export async function authorizedFetch(url, options = {}) {
  let token = localStorage.getItem("accessToken");

  let headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
  };

  let response = await fetch(url, { ...options, headers });

  // Try refreshing if expired
  if (response.status === 401) {
    const refresh = localStorage.getItem("refreshToken");
    if (refresh) {
      const refreshResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/token/refresh/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        }
      );

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem("accessToken", data.access);
        token = data.access;
        headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, { ...options, headers }); // retry
      } else {
        console.error("Refresh token expired — user must log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }
  }

  return response;
}
