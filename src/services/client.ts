import { ApiError } from "./api-error";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const BASE_URL = "";

export async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const fullUrl = `${BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (response.status === 401 && url !== "/api/auth/refresh") {
    const refreshResponse = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    if (refreshResponse.ok) {
      return request(url, options);
    }
    throw new ApiError("Session expirée", 401);
  }

  //Gestion d'erreur
  if (!response.ok) {
    let message = response.statusText;

    try {
      const errorData: unknown = await response.json();

      if (
        errorData &&
        typeof errorData === "object" &&
        "message" in errorData &&
        typeof (errorData as Record<string, unknown>).message === "string"
      ) {
        message = (errorData as Record<string, unknown>).message as string;
      }
    } catch {
      //Si le body n'est pas du json on garde statusText
    }
    throw new ApiError(message, response.status);
  }

  //Gestion succès
  //Cas special : 204  No content

  if (response.status === 204) {
    return undefined as T;
  }

  //ici on fait une constante qui stock le resultat de la requete converti en json donc lisible pour javascript je dirai
  const json: ApiResponse<T> = await response.json();

  //ici on return data as T qui veut dire que le resultat qu'on aura sera bien T ?
  return json.data;
}
