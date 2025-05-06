import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import {
  generateSigner,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

// Function to mint NFT using a connected wallet
async function mintNFT(wallet) {
  try {
    // Set up connection to Solana devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    console.log("Connected to Solana devnet");
    
    // Check if wallet is connected
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    
    console.log("Using connected wallet:", wallet.publicKey.toString());
    
    // Set up Umi with the connected wallet
    const umi = createUmi(connection.rpcEndpoint);
    umi.use(mplTokenMetadata());
    
    // Use the connected wallet as the identity for Umi
    umi.use(walletAdapterIdentity(wallet));
    
    console.log("Set up Umi instance with wallet adapter");
    
    // Optional: Use a collection (remove if not needed)
    const collectionAddress = publicKey(
      "6Hs4nGZ9684mkfAwbvesKZbVr8PrGGregKW2gYzbuv5V"
    );
    
    // Create a new mint signer
    const mint = generateSigner(umi);
    console.log(`Creating NFT with mint address: ${mint.publicKey}`);
    
    // Build the transaction
    const transaction = await createNft(umi, {
      mint,
      name: "India Gate NFT",
      uri: "https://raw.githubusercontent.com/himanshu-rawat77/NFT-Go-main/main/public/sample.json",
      sellerFeeBasisPoints: percentAmount(0),
      collection: {
        key: collectionAddress,
        verified: false,
      },
    });
    
    console.log("Sending transaction...");
    const result = await transaction.sendAndConfirm(umi);
    console.log("Transaction confirmed:", result.signature);
    
    // Wait for the transaction to be fully confirmed
    console.log("Waiting for blockchain confirmation...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
    
    // Implement retry mechanism for fetching the NFT
    let retries = 5;
    let createdNft = null;
    
    while (retries > 0) {
      try {
        console.log(`Attempt to fetch NFT (${retries} retries left)...`);
        createdNft = await fetchDigitalAsset(umi, mint.publicKey);
        console.log("Successfully fetched NFT data");
        break;
      } catch (error) {
        console.log(`Failed to fetch NFT: ${error.message}`);
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between retries
      }
    }
    
    console.log(`🖼️ Created NFT! Address: ${mint.publicKey}`);
    return {
      success: true,
      mintAddress: mint.publicKey,
      nftData: createdNft,
      signature: result.signature
    };
  } catch (error) {
    console.error("Error in mintNFT:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export the function to be used in your app
export { mintNFT };