"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bsc } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";

if (!projectId && typeof window !== "undefined") {
  console.warn(
    "NEXT_PUBLIC_WC_PROJECT_ID is missing. WalletConnect may not work."
  );
}

const connectors = projectId
  ? [
      injected(),
      walletConnect({
        projectId,
        showQrModal: true,
      }),
    ]
  : [injected()];

const config = createConfig({
  chains: [bsc],
  connectors,
  transports: { [bsc.id]: http() },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
