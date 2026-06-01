export interface UserMeShort {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export async function getUserById(id: string): Promise<UserMeShort | null> {
  const res = await fetch(`/api/users/user/${id}`, {
    method: "GET",
    cache: "force-cache",
  });
  if (!res.ok) return null;
  return res.json() as Promise<UserMeShort>;
}
