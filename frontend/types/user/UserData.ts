export interface UserData {
    name: string | null;
    email: string;
    avatarUrl: string | null;
}

export interface FullUserData {
    name: string | null;
    email: string;
    avatarUrl: string | null;
    phoneNumber: string | null;
    joinedAt: string;
    isAdmin?: boolean;
}