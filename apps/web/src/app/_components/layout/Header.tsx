"use client";

import { CubeTransparentIcon, WalletIcon } from "@heroicons/react/24/outline";
import Button from "@repo/ui/button";
import PageHeader from "@repo/ui/pageHeader";
import type { ConnectVariables, Connector } from "@starknet-react/core";

interface HeaderProps {
  address: string | undefined;
  connect: (args?: ConnectVariables | undefined) => void;
  connectors: Connector[];
  disconnect: () => void;
}

function Header({
  address,
  connect,
  connectors,
  disconnect,
}: HeaderProps) {
  const leftIcon = <CubeTransparentIcon className="h-6 w-6 text-content-title" />;

  const loginButton = (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button key={connector.id} onClick={() => connect({ connector })}>
          <div className="flex items-center space-x-2">
            <WalletIcon className="h-5 w-5" />
            <span>Connect</span>
          </div>
        </Button>
      ))}
    </div>
  );

  return (
    <PageHeader 
      title="CofiBlocks" 
      leftIcon={leftIcon} 
      userAddress={address}
      loginButton={!address ? loginButton : undefined}
      onLogout={disconnect}
    />
  );
}

export default Header;