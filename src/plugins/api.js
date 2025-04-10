import { inject } from "vue";

const API_URL = "/api";

function makeApiClient(auth) {
  return {
    async fetch(endpoint, options = {}) {
      const {
        data: { session },
      } = await auth.getSession();

      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    },

    get(endpoint) {
      return this.fetch(endpoint);
    },

    post(endpoint, data) {
      return this.fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    put(endpoint, data) {
      return this.fetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    delete(endpoint) {
      return this.fetch(endpoint, {
        method: "DELETE",
      });
    },
  };
}

export default function makeApiPlugin(auth) {
  return {
    install: (app) => {
      const apiClient = makeApiClient(auth);
      if (process.env.NODE_ENV === "development") {
        window.api = apiClient;
      }
      app.provide("api", apiClient);
    },
  };
}
