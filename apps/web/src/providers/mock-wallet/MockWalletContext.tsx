"use client";

import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface WalletData {
	account: string;
	publicKey: string;
	encryptedPrivateKey: string;
}

interface MockWalletContextType {
	wallet: WalletData | null;
	loading: boolean;
	createWallet: (pin: string) => Promise<WalletData>;
	hasWallet: boolean;
}

const MockWalletContext = createContext<MockWalletContextType | undefined>(
	undefined,
);

export function MockWalletProvider({ children }: { children: ReactNode }) {
	const [wallet, setWallet] = useState<WalletData | null>(null);
	const [_, setLoading] = useState(true);

	useEffect(() => {
		// Load wallet from localStorage on component mount
		const storedWallet = localStorage.getItem("cofiblocks_wallet");
		if (storedWallet) {
			try {
				// Assert the type after parsing
				const parsedWallet = JSON.parse(storedWallet) as WalletData;
				// Basic validation using optional chaining
				if (parsedWallet?.account && parsedWallet?.publicKey) {
					setWallet(parsedWallet);
				} else {
					console.error("Invalid wallet data structure in localStorage");
					localStorage.removeItem("cofiblocks_wallet");
				}
			} catch (e) {
				console.error("Error parsing wallet data:", e);
				localStorage.removeItem("cofiblocks_wallet"); // Clear invalid data
			}
		}
		setLoading(false);
	}, []);

	const createWallet = async (pin: string): Promise<WalletData> => {
		setLoading(true);
		try {
			// Create a mock wallet
			const newWallet: WalletData = {
				account: `0x${Math.random().toString(16).slice(2)}`,
				publicKey: `0x${Math.random().toString(16).slice(2)}`,
				encryptedPrivateKey: `encrypted:${pin}:0x${Math.random().toString(16).slice(2)}`,
			};

			// Store in localStorage
			localStorage.setItem("cofiblocks_wallet", JSON.stringify(newWallet));

			// Update state
			setWallet(newWallet);
			return newWallet;
		} finally {
			setLoading(false);
		}
	};

	const value = {
		wallet,
		loading: _,
		createWallet,
		hasWallet: !!wallet,
	};

	return (
		<MockWalletContext.Provider value={value}>
			{children}
		</MockWalletContext.Provider>
	);
}

export function useMockWallet() {
	const context = useContext(MockWalletContext);
	if (context === undefined) {
		throw new Error("useMockWallet must be used within a MockWalletProvider");
	}
	return context;
}
