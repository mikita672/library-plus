import { API_URL } from "@/lib/api/books"; // I'll check if API_URL is exported there or just use the same pattern

const BASE_URL = "/api/media";

export async function uploadBookCover(bookId: string, file: File): Promise<{ coverURI: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/books/${bookId}/cover`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to upload cover");
  }

  return response.json();
}

export async function uploadUserAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/users/me/avatar`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to upload avatar");
  }

  return response.json();
}
