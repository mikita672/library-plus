export interface UserData {
    name: string | null;
    email: string;
    avatarUrl: string | null;
}

export interface Address {
    country: string | null;
    state: string | null;
    city: string | null;
    street: string | null;
    postalCode: string | null;
    buildingNumber: string | null;
}

export interface FullUserData {
    name: string | null;
    email: string;
    avatarUrl: string | null;
    phoneNumber: string | null;
    address: Address;
    joinedAt: string;
}