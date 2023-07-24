import { createContext, ReactNode, useEffect, useState } from "react";
import NetInfo from '@react-native-community/netinfo';

export type AuthContextDataProps = {
    isConnected: boolean;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps)  {

    

  return (
    <AuthContext.Provider value={{ 
    }}>
      {children}
    </AuthContext.Provider>
  )
}