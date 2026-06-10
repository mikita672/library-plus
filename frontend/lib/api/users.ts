export interface UserMeShort {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
}

export async function getUserById(id: number): Promise<UserMeShort | null> {
  const res = await fetch(`/api/users/user/${id}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json() as UserMeShort;
  if (data.avatarUrl) {
    data.avatarUrl = `${data.avatarUrl}?t=${Date.now()}`;
  }
  return data;
}

export interface AdminUser {
  id: number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  joinedAt: string;
  isDeleted: boolean;
  isAdmin: boolean;
}

export async function getAllUsers(
  pageNumber: number,
  searchToken?: string,
): Promise<AdminUser[]> {
  const sp = new URLSearchParams();
  sp.set("pageNumber", String(pageNumber));
  if (searchToken) sp.set("searchToken", searchToken);

  const res = await fetch(`/api/users/all?${sp.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json() as AdminUser[];
  return data.map(u => {
    if (u.avatarUrl) {
      u.avatarUrl = `${u.avatarUrl}?t=${Date.now()}`;
    }
    return u;
  });
}

export async function getAllUsersPages(searchToken?: string): Promise<number> {
  const sp = new URLSearchParams();
  if (searchToken) sp.set("searchToken", searchToken);

  const res = await fetch(`/api/users/all/pages?${sp.toString()}`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return 1;
  return res.json() as Promise<number>;
}

export async function softDeleteUser(id: number): Promise<boolean> {
  const res = await fetch(`/api/users/user/${id}/delete`, {
    method: "PATCH",
  });
  return res.ok;
}

export async function restoreUser(id: number): Promise<boolean> {
  const res = await fetch(`/api/users/user/${id}/restore`, {
    method: "PATCH",
  });
  return res.ok;
}
