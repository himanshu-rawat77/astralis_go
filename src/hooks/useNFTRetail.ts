// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
// import { PROGRAM_ID, getConnection } from '../lib/web3/connection';
// import { useState, useCallback } from 'react';

// interface NFTShop {
//   address: string;
//   name: string;
//   location: {
//     latitude: number;
//     longitude: number;
//   };
//   nfts: string[];
// }

// export const useNFTRetail = () => {
//   const { publicKey, sendTransaction } = useWallet();
//   const { connection } = useConnection();
//   const [loading, setLoading] = useState(false);

//   const getShops = useCallback(async (): Promise<NFTShop[]> => {
//     const connection = getConnection();
//     const programId = new PublicKey(PROGRAM_ID);

//     try {
//       // Get all program accounts
//       const accounts = await connection.getProgramAccounts(programId);

//       // Parse and return shop data
//       return accounts.map(account => {
//         // Here you would implement the actual data deserialization based on your program's account structure
//         // This is a placeholder that returns mock data
//         return {
//           address: account.pubkey.toString(),
//           name: "Sample NFT Shop",
//           location: {
//             latitude: 40.7128,
//             longitude: -74.0060
//           },
//           nfts: []
//         };
//       });
//     } catch (error) {
//       console.error('Error fetching NFT shops:', error);
//       return [];
//     }
//   }, []);

//   const registerShop = useCallback(async (
//     name: string,
//     latitude: number,
//     longitude: number
//   ): Promise<string> => {
//     if (!publicKey) throw new Error('Wallet not connected');
//     setLoading(true);

//     try {
//       const instruction = new TransactionInstruction({
//         keys: [
//           {
//             pubkey: publicKey,
//             isSigner: true,
//             isWritable: true,
//           },
//         ],
//         programId: new PublicKey(PROGRAM_ID),
//         data: Buffer.from([
//           /* instruction data for registering shop */
//         ]),
//       });

//       const transaction = new Transaction().add(instruction);
//       const signature = await sendTransaction(transaction, connection);
//       await connection.confirmTransaction(signature, 'confirmed');

//       return signature;
//     } catch (error) {
//       console.error('Error registering shop:', error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   }, [publicKey, sendTransaction, connection]);

//   const mintNFT = async (shopAddress: PublicKey) => {
//     if (!publicKey) throw new Error('Wallet not connected');
//     setLoading(true);

//     try {
//       const instruction = new TransactionInstruction({
//         keys: [
//           {
//             pubkey: publicKey,
//             isSigner: true,
//             isWritable: true,
//           },
//           {
//             pubkey: shopAddress,
//             isSigner: false,
//             isWritable: true,
//           },
//         ],
//         programId: new PublicKey(PROGRAM_ID),
//         data: Buffer.from([
//           /* instruction data for minting NFT */
//         ]),
//       });

//       const transaction = new Transaction().add(instruction);
//       const signature = await sendTransaction(transaction, connection);
//       await connection.confirmTransaction(signature, 'confirmed');

//       return signature;
//     } catch (error) {
//       console.error('Error minting NFT:', error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const useNFT = async (nftMint: PublicKey, shopAddress: PublicKey) => {
//     if (!publicKey) throw new Error('Wallet not connected');
//     setLoading(true);

//     try {
//       const instruction = new TransactionInstruction({
//         keys: [
//           {
//             pubkey: publicKey,
//             isSigner: true,
//             isWritable: true,
//           },
//           {
//             pubkey: nftMint,
//             isSigner: false,
//             isWritable: true,
//           },
//           {
//             pubkey: shopAddress,
//             isSigner: false,
//             isWritable: true,
//           },
//         ],
//         programId: new PublicKey(PROGRAM_ID),
//         data: Buffer.from([
//           /* instruction data for using NFT */
//         ]),
//       });

//       const transaction = new Transaction().add(instruction);
//       const signature = await sendTransaction(transaction, connection);
//       await connection.confirmTransaction(signature, 'confirmed');

//       return signature;
//     } catch (error) {
//       console.error('Error using NFT:', error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addNFTToShop = useCallback(async (
//     shopAddress: string,
//     nftMint: string
//   ): Promise<boolean> => {
//     // Here you would implement the logic to add an NFT to a shop's inventory
//     throw new Error('Not implemented');
//   }, []);

//   return {
//     getShops,
//     registerShop,
//     mintNFT,
//     useNFT,
//     addNFTToShop,
//     loading,
//   };
// }; 