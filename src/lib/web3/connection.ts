import { Connection, clusterApiUrl } from '@solana/web3.js';

// Define network (devnet for development)
export const SOLANA_NETWORK = 'devnet' as const;

// Program ID for NFT Retail Program on devnet
export const PROGRAM_ID = '3cPa38rQWYLJ6iij1crMnCgzV3q42sR1ae42tWdGhjqs';

// Initialize connection to Solana devnet
let connection: Connection | null = null;

export const getConnection = (): Connection => {
  if (!connection) {
    connection = new Connection(clusterApiUrl(SOLANA_NETWORK), 'confirmed');
  }
  return connection;
};

// Helper function to get explorer URL
export function getExplorerUrl(signature: string, cluster: string = SOLANA_NETWORK) {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
} 