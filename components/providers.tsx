"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  connectorsForWallets,
  getDefaultWallets,
  DisclaimerComponent,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { injectedWallet, metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, holesky } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const apiKey = process.env.NEXT_PUBLIC_INFURA_KEY || "";
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";

const { chains, publicClient } = configureChains(
  [mainnet, holesky],
  [
    jsonRpcProvider({ 
      rpc: (chain) => {
        if (chain.id === mainnet.id) {
          return {
            http: `${process.env.NEXT_PUBLIC_RPC_MAINNET}`,
          };
        } else {
          return null;
        }
      },
    }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Frens",
  projectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to the{" "}
    <Link href="https://app.frens.fun/terms">Terms of Service</Link> and
    acknowledge you have read and understand the protocol{" "}
    <Link href="https://app.frens.fun/disclaimer">Disclaimer</Link>
  </Text>
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        appInfo={{
          appName: "FRENS",
          disclaimer: Disclaimer,
        }}
        theme={lightTheme({
          accentColor: "#3F19EE",
        })}
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
