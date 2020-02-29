import React, { useState, useEffect, useMemo } from "react";
import { api, SelfUser } from "../lib/api";

interface AuthState {
  readonly user: SelfUser | null;
  readonly isChecking: boolean;
  setUser(user: SelfUser | null): void;
}

const AuthContext = React.createContext<AuthState | undefined>(undefined);

export const useAuthContext = () => {
  const val = React.useContext(AuthContext);
  if (!val) {
    throw new Error("AuthProvider isn't in the render tree for this component!");
  }
  return val;
};

/**
 * SetupModeProvider provides a method for setup mode to be specified.
 */
export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<SelfUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setIsChecking(true);
    api.getSelf().then(res => {
      setUser(res);
    }).catch(() => {
      // no-op
    }).finally(() => {
      setIsChecking(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isChecking,
      setUser,
    }),
    [user, isChecking],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
