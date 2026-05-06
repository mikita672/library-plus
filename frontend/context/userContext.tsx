import { LoginFormSchema, SignUpFormSchema } from "@/forms/auth";
import { AuthResponseDTO } from "@/types/auth/dto";
import { FullUserData, UserData } from "@/types/user/UserData";
import React, { createContext, useEffect, useState } from "react";

export interface IUserContext {
  userData: UserData | null;
  fullUserData: FullUserData | null;
  isLoading: boolean;
  login: ({ email, password }: LoginFormSchema) => Promise<string | null>;
  signup: ({ email, password }: SignUpFormSchema) => Promise<string | null>;
  logout: () => Promise<string | null>;
  refreshUser: () => Promise<void>;
  refreshFullUser: () => Promise<void>;
}

export const userContext = createContext({} as IUserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fullUserData, setFullUserData] = useState<FullUserData | null>(null);

  const refreshUser = async () => {
    setIsLoading(true);
    const response = await fetch("/api/user/meShort", {
      method: "GET",
    });

    if (response.ok) {
      setUserData(await response.json());
    } else {
      setUserData(null);
    }
    setIsLoading(false);
  };

  const refreshFullUser = async () => {
    setIsLoading(true);
    const response = await fetch("/api/v1/user/me", { method: "GET" });

    if (response.ok) {
      setFullUserData(await response.json());
    } else {
      setFullUserData(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async ({
    email,
    password,
  }: LoginFormSchema): Promise<string | null> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return "Bad credentials";
    }
    return null;
  };

  const signup = async ({
    email,
    password,
  }: SignUpFormSchema): Promise<string | null> => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data: AuthResponseDTO = await response.json().catch(() => {});
      return data.message ?? "something went wrong";
    }
    return null;
  };

  const logout = async (): Promise<string | null> => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const data: AuthResponseDTO = await response.json().catch(() => {});
      return data.message ?? "something went wrong";
    }

    setUserData(null);
    return null;
  };

  return (
    <userContext.Provider
      value={{
        userData,
        fullUserData,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        refreshFullUser,
      }}
    >
      {children}
    </userContext.Provider>
  );
};
