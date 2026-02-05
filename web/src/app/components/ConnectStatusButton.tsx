"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function shortAddress(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ConnectStatusButton({
  className = "btn btn-primary",
}: {
  className?: string;
}) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button className={className} onClick={() => disconnect()}>
        Connected: {shortAddress(address)}
      </button>
    );
  }

  const connector = connectors[0];
  return (
    <button
      className={className}
      onClick={() => connector && connect({ connector })}
      disabled={isPending}
    >
      Connect Wallet
    </button>
  );
}
