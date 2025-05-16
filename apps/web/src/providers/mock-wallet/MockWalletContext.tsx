"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface MockWallet {
  account: string;
  publicKey: string;
  encryptedPrivateKey: string;
}

interface MockWalletContextType {
  wallet: MockWallet | null;
  loading: boolean;
  hasWallet: boolean;
}

const MockWalletContext = createContext<MockWalletContextType>({
  wallet: null,
  loading: true,
  hasWallet: false,
});

export function MockWalletProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<MockWallet | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    // Get wallet from Clerk metadata
    const walletData = user?.publicMetadata?.wallet as MockWallet | undefined;
    
    if (walletData) {
      setWallet(walletData);
    } else {
      // For development, create a mock wallet if none exists
      const mockWallet: MockWallet = {
        account: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        publicKey: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        encryptedPrivateKey: "encrypted:mock:key",
      };
      setWallet(mockWallet);
    }

    setLoading(false);
  }, [user, isLoaded]);

  return (
    <MockWalletContext.Provider
      value={{
        wallet,
        loading,
        hasWallet: !!wallet,
      }}
    >
      {children}
    </MockWalletContext.Provider>
  );
}

export function useMockWallet() {
  const context = useContext(MockWalletContext);
  if (!context) {
    throw new Error("useMockWallet must be used within a MockWalletProvider");
  }
  return context;
} 