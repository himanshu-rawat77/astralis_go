// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// import { clusterApiUrl } from '@solana/web3.js';
// import { SOLANA_NETWORK } from '../lib/web3/connection';

// // Import wallet adapter CSS
// require('@solana/wallet-adapter-react-ui/styles.css');

// const WalletContext = createContext<{
//   connected: boolean;
//   connecting: boolean;
//   publicKey: string | null;
//   connect: () => Promise<void>;
//   disconnect: () => Promise<void>;
// }>({
//   connected: false,
//   connecting: false,
//   publicKey: null,
//   connect: async () => {},
//   disconnect: async () => {},
// });

// export function WalletContextProvider({ children }: { children: ReactNode }) {
//   // Configure the wallet adapters
//   const wallets = [new PhantomWalletAdapter()];
//   const endpoint = clusterApiUrl(SOLANA_NETWORK);

//   return (
//     <ConnectionProvider endpoint={endpoint}>
//       <WalletProvider wallets={wallets} autoConnect>
//         <WalletModalProvider>
//           {children}
//         </WalletModalProvider>
//       </WalletProvider>
//     </ConnectionProvider>
//   );
// }

// export const useWallet = () => useContext(WalletContext); 