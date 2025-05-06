import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata, createNft, fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity, generateSigner, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { mintLocationNFT, NFTMetadata, Location } from '@/lib/nft-utils';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PROGRAM_ID } from '@/lib/web3/connection';

interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  shopName: string;
  category: 'common' | 'rare' | 'epic' | 'legendary';
  distance?: number; // in kilometers
  duration?: number; // in minutes
  location: {
    lat: number;
    lng: number;
  };
  claimedAt: string;
  mint?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  progress: number;
  shopName: string;
  reward: string;
  expiresAt?: Date;
  type: 'shop' | 'platform' | 'event';
}

interface Shop {
  id: string;
  name: string;
  logo: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface NFTContextType {
  nfts: NFT[];
  claimedNFTs: NFT[];
  tasks: Task[];
  shops: Shop[];
  claimNFT: (nftData: Omit<NFT, 'claimedAt'>) => Promise<boolean>;
  updateNFTMint: (nftId: string, mintAddress: string) => void;
  getUserNFTs: () => Promise<NFT[]>;
  loading: boolean;
  error: string | null;
  selectedNFT: NFT | null;
  setSelectedNFT: (nft: NFT | null) => void;
  setCurrentNFT: (nft: NFT | null) => void;
  filterNFTs: (category?: string, distance?: number) => NFT[];
  refreshNFTs: () => Promise<void>;
  userLocation: Location | null;
  setUserLocation: (location: Location | null) => void;
  watchUserLocation: () => void;
  stopWatchingLocation: () => void;
  isLoading: boolean;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

const SAMPLE_LOCATIONS = [
  { lat: 28.4996139, lng: 77.2457196, name: "India Gate NFT Gallery" },
  { lat: 28.5148783, lng: 77.2339564, name: "National Museum Digital Arts" },
  { lat: 28.5146879, lng: 77.2424753, name: "Pragati Maidan Collectibles" },
  { lat: 28.5172767, lng: 77.2237611, name: "Delhi High Court Heritage NFTs" },
  { lat: 28.4962337, lng: 77.2397570, name: "Purana Qila Digital Hub" },
  { lat: 28.5135381, lng: 77.2293277, name: "Central Secretariat Gallery" },
  { lat: 28.5123091, lng: 77.2331352, name: "National Archives Collection" },
  { lat: 28.5183798, lng: 77.2346119, name: "Connaught Place NFT Market" },
];

export function NFTProvider({ children }: { children: ReactNode }) {
  const [nfts, setNfts] = useState<NFT[]>([
    {
      id: '1',
      name: 'India Gate Memorial NFT',
      description: 'Exclusive digital collectible capturing the majestic India Gate. Limited edition design celebrating this iconic monument.',
      imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22',
      shopName: SAMPLE_LOCATIONS[0].name,
      category: 'rare',
      location: { lat: SAMPLE_LOCATIONS[0].lat, lng: SAMPLE_LOCATIONS[0].lng },
      claimedAt: '',
    },
    {
      id: '2',
      name: 'National Museum Artifacts',
      description: 'Digital representation of precious artifacts from the National Museum. A blend of history and digital art.',
      imageUrl: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07',
      shopName: SAMPLE_LOCATIONS[1].name,
      category: 'legendary',
      location: { lat: SAMPLE_LOCATIONS[1].lat, lng: SAMPLE_LOCATIONS[1].lng },
      claimedAt: '',
    },
    {
      id: '3',
      name: 'Pragati Maidan Innovation',
      description: 'Modern NFT art inspired by the innovative spirit of Pragati Maidan. Each piece represents progress.',
      imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027',
      shopName: SAMPLE_LOCATIONS[2].name,
      category: 'epic',
      location: { lat: SAMPLE_LOCATIONS[2].lat, lng: SAMPLE_LOCATIONS[2].lng },
      claimedAt: '',
    },
    {
      id: '4',
      name: 'Heritage Justice Collection',
      description: 'Digital art collection inspired by the Delhi High Court architecture. Limited availability.',
      imageUrl: 'https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07',
      shopName: SAMPLE_LOCATIONS[3].name,
      category: 'rare',
      location: { lat: SAMPLE_LOCATIONS[3].lat, lng: SAMPLE_LOCATIONS[3].lng },
      claimedAt: '',
    },
    {
      id: '5',
      name: 'Purana Qila Chronicles',
      description: 'Dynamic NFT artwork capturing the ancient beauty of Purana Qila. A must-have for history enthusiasts.',
      imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df',
      shopName: SAMPLE_LOCATIONS[4].name,
      category: 'epic',
      location: { lat: SAMPLE_LOCATIONS[4].lat, lng: SAMPLE_LOCATIONS[4].lng },
      claimedAt: '',
    },
    {
      id: '6',
      name: 'Secretariat Serenity',
      description: 'Premium digital collectible showcasing the grandeur of Central Secretariat. Exclusive to this location.',
      imageUrl: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
      shopName: SAMPLE_LOCATIONS[5].name,
      category: 'legendary',
      location: { lat: SAMPLE_LOCATIONS[5].lat, lng: SAMPLE_LOCATIONS[5].lng },
      claimedAt: '',
    },
    {
      id: '7',
      name: 'Archives Anthology',
      description: 'Historical NFT collection from the National Archives. Limited edition series.',
      imageUrl: 'https://images.unsplash.com/photo-1460411794035-42aac080490a',
      shopName: SAMPLE_LOCATIONS[6].name,
      category: 'epic',
      location: { lat: SAMPLE_LOCATIONS[6].lat, lng: SAMPLE_LOCATIONS[6].lng },
      claimedAt: '',
    },
    {
      id: '8',
      name: 'CP Digital Collection',
      description: 'Contemporary art NFT from Connaught Place. A perfect blend of colonial architecture and digital art.',
      imageUrl: 'https://images.unsplash.com/photo-1496449903678-68ddcb189a24',
      shopName: SAMPLE_LOCATIONS[7].name,
      category: 'common',
      location: { lat: SAMPLE_LOCATIONS[7].lat, lng: SAMPLE_LOCATIONS[7].lng },
      claimedAt: '',
    },
  ]);
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Visit Local Shop A',
      description: 'Visit Local Shop A and scan the QR code to claim an exclusive NFT',
      progress: 0,
      shopName: 'Local Shop A',
      reward: 'Exclusive Shop A NFT',
      type: 'shop',
    },
    {
      id: '2',
      title: 'Purchase from Local Shop B',
      description: 'Make a purchase at Local Shop B and claim your reward',
      progress: 50,
      shopName: 'Local Shop B',
      reward: '10% Discount on Next Purchase',
      type: 'shop',
    },
    {
      id: '3',
      title: 'Collect 5 NFTs',
      description: 'Collect 5 different NFTs from any shop',
      progress: 20,
      shopName: 'Platform Challenge',
      reward: 'Rare Platform NFT',
      type: 'platform',
    },
    {
      id: '4',
      title: 'Summer Festival NFT Hunt',
      description: 'Visit 3 shops participating in the summer festival',
      progress: 33,
      shopName: 'Summer Festival',
      reward: 'Limited Edition Summer NFT',
      expiresAt: new Date('2025-06-30'),
      type: 'event',
    },
  ]);

  const [shops] = useState<Shop[]>([
    {
      id: '1',
      name: 'India Gate NFT Gallery',
      logo: 'https://via.placeholder.com/50',
      location: { lat: 28.5061144, lng: 77.2382497 },
    },
    {
      id: '2',
      name: 'National Museum Digital Arts',
      logo: 'https://via.placeholder.com/50',
      location: { lat: 28.5148783, lng: 77.2339564 },
    },
    {
      id: '3',
      name: 'Pragati Maidan Collectibles',
      logo: 'https://via.placeholder.com/50',
      location: { lat: 28.5146879, lng: 77.2424753 },
    },
  ]);

  const [claimedNFTs, setClaimedNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [umi, setUmi] = useState<any>(null);
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Solana connection and Umi
  useEffect(() => {
    let mounted = true;

    const initializeBlockchain = async () => {
      if (!mounted) return;
      
      setLoading(true);
      setError(null);

      try {
        const connection = new Connection(clusterApiUrl("devnet"));
        let umiInstance = createUmi(connection.rpcEndpoint);
        
        if (!umiInstance) {
          throw new Error("Failed to create Umi instance");
        }

        umiInstance.use(mplTokenMetadata());
        
        if (mounted) {
          setUmi(umiInstance);
          setError(null);
        }
      } catch (err) {
        console.error("Blockchain initialization failed:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to initialize blockchain connection");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeBlockchain();

    return () => {
      mounted = false;
    };
  }, []);

  const watchUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Failed to get user location");
        }
      );
    }
  };

  const claimNFT = useCallback(async (nftData: Omit<NFT, 'claimedAt'>) => {
    if (!wallet.publicKey || !wallet.connected) return false;
    
    setIsLoading(true);
    try {
      // Add to claimed NFTs immediately with current timestamp
      const newNFT: NFT = {
        ...nftData,
        claimedAt: new Date().toISOString(),
        mint: 'pending' // Will be updated when blockchain confirmation is received
      };
      
      setClaimedNFTs(prev => [...prev, newNFT]);

      // Return true to indicate successful claim
      return true;
    } catch (error) {
      console.error('Error claiming NFT:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, wallet.connected]);

  // Add function to update NFT mint address
  const updateNFTMint = useCallback((nftId: string, mintAddress: string) => {
    setClaimedNFTs(prev => prev.map(nft => 
      nft.id === nftId ? { ...nft, mint: mintAddress } : nft
    ));
  }, []);

  const getUserNFTs = async () => {
    // TODO: Implement fetching user's NFTs from blockchain
    return nfts.filter(nft => nft.claimedAt !== '');
  };

  // Simulate refresh functionality
  const refreshNFTs = async () => {
    setLoading(true);
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In a real app, this would be an API call to get fresh data
      // For now, we'll just refresh with the same data
      setNfts([...nfts]);
    } catch (err) {
      setError('Failed to refresh NFTs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter NFTs based on category and distance
  const filterNFTs = (category?: string, distance?: number) => {
    return nfts.filter(nft => {
      let categoryMatch = true;
      let distanceMatch = true;
      
      if (category && category !== 'all') {
        categoryMatch = nft.category === category;
      }
      
      if (distance) {
        distanceMatch = (nft.distance || 0) <= distance;
      }
      
      return categoryMatch && distanceMatch;
    });
  };

  return (
    
    <NFTContext.Provider value={{ 
      nfts, 
      claimedNFTs, 
      tasks, 
      shops,
      claimNFT,
      updateNFTMint,
      getUserNFTs,
      loading, 
      error, 
      selectedNFT, 
      setSelectedNFT,
      setCurrentNFT: setSelectedNFT,
      filterNFTs,
      refreshNFTs,
      userLocation,
      setUserLocation,
      watchUserLocation,
      stopWatchingLocation: () => {},
      isLoading
    }}>
      {children}
    </NFTContext.Provider>
  );
}

export function useNFT() {
  const context = useContext(NFTContext);
  if (context === undefined) {
    throw new Error('useNFT must be used within a NFTProvider');
  }
  return context;
}
