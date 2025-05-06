import { PublicKey } from "@solana/web3.js";
import {
  createNft,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

export interface Location {
  lat: number;
  lng: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  location: Location;
  shopName: string;
  claimDate?: string;
}

export const verifyUserLocation = (
  userLocation: Location,
  nftLocation: Location,
  maxDistanceKm: number = 0.1
): boolean => {
  if (!userLocation || !nftLocation) {
    throw new Error("Invalid location data provided");
  }

  if (typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number' ||
      typeof nftLocation.lat !== 'number' || typeof nftLocation.lng !== 'number') {
    throw new Error("Invalid coordinates provided");
  }

  const R = 6371; // Earth's radius in km
  const dLat = (nftLocation.lat - userLocation.lat) * Math.PI / 180;
  const dLon = (nftLocation.lng - userLocation.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(nftLocation.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= maxDistanceKm;
};

export const generateNFTMetadata = (
  nft: NFTMetadata
): string => {
  if (!nft.name || !nft.description || !nft.image || !nft.location || !nft.shopName) {
    throw new Error("Missing required NFT metadata fields");
  }

  const metadata = {
    name: nft.name,
    description: nft.description,
    image: nft.image,
    attributes: [
      {
        trait_type: "Location",
        value: nft.shopName
      },
      {
        trait_type: "Latitude",
        value: nft.location.lat.toString()
      },
      {
        trait_type: "Longitude",
        value: nft.location.lng.toString()
      },
      {
        trait_type: "Claim Date",
        value: nft.claimDate || new Date().toISOString()
      }
    ]
  };

  return JSON.stringify(metadata);
};

export const mintLocationNFT = async (
  umi: any,
  metadata: NFTMetadata,
  collectionAddress: string
) => {
  if (!umi) {
    throw new Error("Blockchain connection not initialized");
  }

  if (!collectionAddress) {
    throw new Error("Collection address is required");
  }

  try {
    // Validate metadata before minting
    generateNFTMetadata(metadata);

    const mint = generateSigner(umi);
    
    const transaction = await createNft(umi, {
      mint,
      name: metadata.name,
      uri: "https://raw.githubusercontent.com/himanshu-rawat77/NFT-Go-main/main/public/sample.json",
      sellerFeeBasisPoints: percentAmount(0),
      collection: {
        key: publicKey(collectionAddress),
        verified: false,
      },
    });

    await transaction.sendAndConfirm(umi);
    const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
    
    return createdNft;
  } catch (error) {
    console.error("Error minting NFT:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }
    throw new Error("Failed to mint NFT: Unknown error");
  }
}; 