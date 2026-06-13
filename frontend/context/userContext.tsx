import {
  LoginFormSchema,
  PasswordResetFormSchema,
  SignUpFormSchema,
} from "@/forms/auth";
import { AuthResponseDTO } from "@/types/auth/dto";
import { FullUserData, UserData } from "@/types/user/UserData";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

export interface IUserContext {
  userData: UserData | null;
  fullUserData: FullUserData | null;
  isLoading: boolean;
  login: ({ email, password }: LoginFormSchema) => Promise<string | null>;
  signup: ({ email, password }: SignUpFormSchema) => Promise<string | null>;
  logout: () => Promise<string | null>;
  resetPassword: ({ email }: PasswordResetFormSchema) => Promise<string | null>;
  refreshUser: (showLoading?: boolean) => Promise<void>;
  refreshFullUser: (showLoading?: boolean) => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

export const userContext = createContext({} as IUserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fullUserData, setFullUserData] = useState<FullUserData | null>(null);

  const refreshUser = useCallback(async (showLoading = true) => {
    if (showLoading) { setIsLoading(true); }
    try {
      const response = await fetch("/api/users/meShort", {
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.avatarUrl) {
          data.avatarUrl = `${data.avatarUrl}?t=${Date.now()}`;
        }
        setUserData(data);
      } else {
        setUserData(null);
      }
    } catch {
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFullUser = useCallback(async (showLoading = true) => {
    if (showLoading) { setIsLoading(true); }
    try {
      const response = await fetch("/api/users/me", { 
        method: "GET",
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.avatarUrl) {
          data.avatarUrl = `${data.avatarUrl}?t=${Date.now()}`;
        }
        setFullUserData(data);
      } else {
        setFullUserData(null);
      }
    } catch {
      setFullUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void refreshUser(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [refreshUser]);

  const login = useCallback(async ({
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
  }, []);

  const signup = useCallback(async ({
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
      return data?.message ?? "something went wrong";
    }
    return null;
  }, []);

  const logout = useCallback(async (): Promise<string | null> => {
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
    setFullUserData(null);
    return null;
  }, []);

  const resetPassword = useCallback(async ({
    email,
  }: PasswordResetFormSchema): Promise<string | null> => {
    const response = await fetch("/api/auth/reset-password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (response.status === 400) {
      return "Bad request";
    } else if (response.status === 204) {
      return "Password was reset, email was not sent";
    }
    if (!response.ok) {
      return "Unknown error";
    }
    return null;
  }, []);

  const updateName = useCallback(async (newName: string) => {
    await fetch("/api/users/updateName", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newName }),
    });
  }, []);

  const contextValue = useMemo(() => ({
    userData,
    fullUserData,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
    refreshFullUser,
    resetPassword,
    updateName,
  }), [
    userData,
    fullUserData,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
    refreshFullUser,
    resetPassword,
    updateName,
  ]);

  return (
    <userContext.Provider value={contextValue}>
      {children}
    </userContext.Provider>
  );
};
