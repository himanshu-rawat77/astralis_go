import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import * as web3 from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import { NFTProvider } from "@/contexts/NFTContext";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import NFTDetail from "./pages/NFTDetail";
import Map from "./pages/Map";
import Rewards from "./pages/Rewards";
import Shop from "./pages/Shop";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { useMemo } from "react";
import { CivicAuthProvider } from "@civic/auth-web3/react";
import { LoginContent } from "./pages/login";

const queryClient = new QueryClient();

const App = () => {
  // Set up network and endpoint
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => web3.clusterApiUrl(network), [network]);

  // Initialize all supported wallets
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <CivicAuthProvider clientId="d36d9692-89a3-4850-8058-9c9ee767812e">
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <NFTProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />}>
                        <Route
                          index
                          element={<Navigate to="/explore" replace />}
                        />
                        <Route path="explore" element={<Explore />} />
                        <Route path="nft/:nftId" element={<NFTDetail />} />
                        <Route path="map" element={<Map />} />
                        <Route path="rewards" element={<Rewards />} />
                        <Route path="shop" element={<Shop />} />
                        <Route path="profile" element={<Profile />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                      <Route path="/login" element={<LoginContent />} />
                    </Routes>
                  </BrowserRouter>
                </NFTProvider>
              </TooltipProvider>
            </QueryClientProvider>
          </CivicAuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
