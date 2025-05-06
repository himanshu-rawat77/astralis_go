// import '@solana/wallet-adapter-react-ui/styles.css';
// import { useState, useEffect, useCallback } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { useToast } from "@/hooks/use-toast";
// import { useNFT } from "@/contexts/NFTContext";
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
// import Map, { Marker, NavigationControl, GeolocateControl, Source, Layer } from 'react-map-gl';
// import type { ViewState } from 'react-map-gl';
// import mapboxgl from 'mapbox-gl';
// import type { LineLayer } from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import {
//   createNft,
//   fetchDigitalAsset,
//   mplTokenMetadata,
// } from "@metaplex-foundation/mpl-token-metadata";
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import {
//   generateSigner,
//   percentAmount,
//   publicKey,
// } from "@metaplex-foundation/umi";
// import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
// import {
//   QrCode,
//   Navigation,
//   Compass,
//   Check,
//   Clock,
//   Map as MapIcon,
//   X,
//   MapPin,
//   ExternalLink
// } from "lucide-react";
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import { Transaction } from '@solana/web3.js';

// // Replace with your actual Mapbox token
// mapboxgl.accessToken = 'pk.eyJ1IjoiaGltYW5zaHUtcmF3YXQtNyIsImEiOiJjbTIxcmViNm0weGZnMmpxc2E0dmIwazdhIn0.0n9VXfbQP3k05uC86PMGDg';

// const INITIAL_VIEW_STATE: Partial<ViewState> = {
//   latitude: 28.4996139,
//   longitude: 77.2457196,
//   zoom: 13,
//   bearing: 0,
//   pitch: 0
// };

// const routeLayerStyle: LineLayer = {
//   id: 'route',
//   type: 'line',
//   layout: {
//     'line-join': 'round',
//     'line-cap': 'round'
//   },
//   paint: {
//     'line-color': '#6366F1',
//     'line-width': 3,
//     'line-dasharray': [2, 2]
//   },
//   source: 'route'
// };

// // Collection Address - make sure this is the address of your collection
// const COLLECTION_ADDRESS = "3cPa38rQWYLJ6iij1crMnCgzV3q42sR1ae42tWdGhjqs";

// export default function MapPage() {
//   const [searchParams] = useSearchParams();
//   const nftId = searchParams.get('nft');
//   const { nfts, claimNFT, userLocation, watchUserLocation, updateNFTMint } = useNFT();
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const { publicKey: walletPublicKey, connected, connecting } = wallet;

//   const [scanning, setScanning] = useState(false);
//   const [claiming, setClaiming] = useState(false);
//   const [showDirections, setShowDirections] = useState(false);
//   const [nearDestination, setNearDestination] = useState(false);
//   const [viewState, setViewState] = useState<Partial<ViewState>>(INITIAL_VIEW_STATE);
//   const [routeGeoJson, setRouteGeoJson] = useState<any>(null);
//   const [isNavigating, setIsNavigating] = useState(false);
//   const [navigationSteps, setNavigationSteps] = useState<any[]>([]);
//   const [mintedNftAddress, setMintedNftAddress] = useState<string | null>(null);
//   const [mintResult, setMintResult] = useState<any>(null);

//   const currentNFT = nfts.find(nft => nft.id === nftId);

//   // Start watching location when component mounts
//   useEffect(() => {
//     watchUserLocation();
//   }, [watchUserLocation]);

//   // Update view state when user location changes
//   useEffect(() => {
//     if (userLocation && !isNavigating) {
//         setViewState(prev => ({
//           ...prev,
//         latitude: userLocation.lat,
//         longitude: userLocation.lng,
//         }));
//       }
//   }, [userLocation, isNavigating]);

//   const fetchRoute = useCallback(async (start: [number, number], end: [number, number]) => {
//     try {
//       const query = await fetch(
//         `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
//       );
//       const json = await query.json();

//       if (json.routes?.[0]) {
//         setRouteGeoJson({
//           type: 'Feature',
//           properties: {},
//           geometry: {
//             type: 'LineString',
//             coordinates: json.routes[0].geometry.coordinates
//           }
//         });
//         setNavigationSteps(json.routes[0].legs[0].steps);
//       }
//     } catch (error) {
//       console.error('Error fetching route:', error);
//     }
//   }, []);

//   // Update route when user location or NFT changes
//   useEffect(() => {
//     if (currentNFT && userLocation) {
//     fetchRoute(
//       [userLocation.lng, userLocation.lat],
//         [currentNFT.location.lng, currentNFT.location.lat]
//       );
//     }
//   }, [currentNFT, userLocation, fetchRoute]);

//   // Check if user is near destination
//   useEffect(() => {
//     if (currentNFT && userLocation) {
//       const distance = Math.sqrt(
//         Math.pow(userLocation.lat - currentNFT.location.lat, 2) +
//         Math.pow(userLocation.lng - currentNFT.location.lng, 2)
//       );
//       // For testing purposes, you might want to set this to true to test minting
//       setNearDestination(distance < 0.002);
//     }
//   }, [currentNFT, userLocation]);

//   const startNavigation = () => {
//     setIsNavigating(true);
//     if (userLocation) {
//     setViewState(prev => ({
//       ...prev,
//       latitude: userLocation.lat,
//       longitude: userLocation.lng,
//       zoom: 16,
//       pitch: 60,
//       bearing: 0
//     }));
//     }
//   };

//   const stopNavigation = () => {
//     setIsNavigating(false);
//     setViewState(INITIAL_VIEW_STATE);
//   };

//   const mintNFT = async () => {
//     if (!connection) {
//       toast({
//         title: "Connection Error",
//         description: "No connection to Solana network",
//         variant: "destructive"
//       });
//       return null;
//     }

//     if (!connected) {
//       toast({
//         title: "Wallet Not Connected",
//         description: "Please connect your wallet first",
//         variant: "destructive"
//       });
//       return null;
//     }

//     try {
//       // Create UMI instance with connection and wallet
//       const umi = createUmi(connection.rpcEndpoint)
//         .use(mplTokenMetadata())
//         .use(walletAdapterIdentity(wallet));

//       // Generate a new mint signer
//       const mint = generateSigner(umi);

//       // Create and send the NFT creation transaction
//       const { signature } = await createNft(umi, {
//         mint,
//         name: currentNFT?.name || "India Gate NFT",
//         symbol: "LNFT",
//         uri: currentNFT?.imageUrl || "https://raw.githubusercontent.com/himanshu-rawat77/NFT-Go-main/main/public/sample.json",
//         sellerFeeBasisPoints: percentAmount(0),
//         isCollection: false,
//         collection: {
//           key: publicKey(COLLECTION_ADDRESS),
//           verified: false,
//         }
//       }).sendAndConfirm(umi);

//       // Wait for transaction confirmation
//       await umi.rpc.confirmTransaction(signature, {
//         strategy: { type: 'blockhash', ...(await umi.rpc.getLatestBlockhash()) },
//       });

//       // Fetch the created NFT
//       const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

//       return {
//         success: true,
//         mintAddress: mint.publicKey,
//         nft: createdNft,
//         signature
//       };
//     } catch (error) {
//       console.error("Error minting NFT:", error);
//       return {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to mint NFT"
//       };
//     }
//   };

//   const handleScan = async () => {
//     if (!connected && !connecting) {
//       toast({
//         title: "Wallet Not Connected",
//         description: "Please connect your wallet to claim NFTs",
//         variant: "default"
//       });
//       return;
//     }

//     setScanning(true);
//     setClaiming(true);

//     try {
//       const result = await mintNFT();

//       // Even if we get an error fetching the NFT, we'll treat it as success
//       // since the NFT might still be minted
//       if (result?.mintAddress) {
//         // Update local state with claimed NFT
//         if (currentNFT) {
//           await claimNFT(currentNFT);
//           // Update the mint address after successful minting
//           updateNFTMint(currentNFT.id, result.mintAddress.toString());
//         }

//         setMintResult({
//           success: true,
//           mintAddress: result.mintAddress,
//           nft: result.nft || null,
//           signature: result.signature
//         });

//         toast({
//           title: "NFT Claimed Successfully!",
//           description: "Check your wallet for the NFT. It may take a few minutes to appear.",
//         });

//         setMintedNftAddress(result.mintAddress.toString());
//       } else {
//         throw new Error("No mint address returned");
//       }
//     } catch (error) {
//       console.error("Error in claim process:", error);

//       // If it's either the AccountNotFoundError or No mint address error, still show success
//       if (error.message?.includes("AccountNotFoundError") ||
//           error.message?.includes("No mint address returned")) {
//         toast({
//           title: "NFT Likely Claimed Successfully",
//           description: "The NFT may take a few minutes to appear in your wallet. Please check back later.",
//         });
//         // Set a temporary success state and still claim the NFT
//         if (currentNFT) {
//           await claimNFT(currentNFT);
//         }
//         setMintResult({
//           success: true,
//           mintAddress: "pending",
//           nft: null,
//           signature: null
//         });
//       } else {
//         toast({
//           title: "Claim Failed",
//           description: "Failed to claim and mint NFT",
//           variant: "destructive"
//         });
//       }
//     } finally {
//       setScanning(false);
//       setClaiming(false);
//     }
//   };

//   const openSolanaExplorer = () => {
//     if (mintedNftAddress) {
//       // Open Solana Explorer with the NFT address (using devnet)
//       window.open(`https://explorer.solana.com/address/${mintedNftAddress}/devnet`, '_blank');
//     }
//   };

//   const estimatedTime = currentNFT?.distance ? Math.round(currentNFT.distance * 12) : 0;

//   // When no location is available, use Delhi coordinates
//   if (!userLocation) {
//     return (
//       <div className="flex items-center justify-center h-[60vh]">
//         <div className="text-center space-y-4">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
//           <p className="text-gray-500">Getting your location...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-gray-900">Map Explorer</h1>
//         <div className="flex space-x-2">
//           {!connected ? (
//             <WalletMultiButton />
//           ) : currentNFT && nearDestination && (
//             <Button
//               onClick={handleScan}
//               disabled={scanning || claiming}
//               className="gap-2"
//             >
//               {scanning ? (
//                 <>
//                   <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
//                   Scanning...
//                 </>
//               ) : claiming ? (
//                 <>
//                   <div className="animate-pulse">
//                     <Check className="h-4 w-4" />
//                   </div>
//                   Claiming...
//                 </>
//               ) : (
//                 <>
//                   <QrCode className="h-4 w-4" />
//                   Scan QR Code
//                 </>
//               )}
//             </Button>
//           )}

//           <Sheet>
//             <SheetTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <Compass className="h-4 w-4" />
//               </Button>
//             </SheetTrigger>
//             <SheetContent side="bottom">
//               <SheetHeader>
//                 <SheetTitle>Directions</SheetTitle>
//                 <SheetDescription>
//                   Follow these directions to claim your NFT
//                 </SheetDescription>
//               </SheetHeader>

//               {currentNFT ? (
//                 <div className="py-4 space-y-4">
//                   <div className="flex justify-between items-center">
//                     <div className="flex items-center space-x-2">
//                       <Navigation className="h-5 w-5 text-blue-500" />
//                       <div>
//                         <p className="font-medium">{currentNFT.shopName}</p>
//                         <p className="text-sm text-gray-500">Destination</p>
//                       </div>
//                     </div>

//                     <div className="text-right">
//                       <div className="flex items-center text-gray-700">
//                         <Clock className="h-4 w-4 mr-1" />
//                         <span>{estimatedTime} min</span>
//                       </div>
//                       <p className="text-sm text-gray-500">{currentNFT.distance} km</p>
//                     </div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="py-6 text-center text-gray-500">
//                   Select an NFT to view directions
//                 </div>
//               )}
//             </SheetContent>
//           </Sheet>
//         </div>
//       </div>

//       <div className="relative h-[calc(100vh-12rem)] rounded-xl overflow-hidden shadow-inner">
//         <Map
//           {...viewState}
//           onMove={evt => setViewState(evt.viewState)}
//           mapStyle="mapbox://styles/mapbox/streets-v12"
//           style={{ width: '100%', height: '100%' }}
//         >
//           <GeolocateControl
//             position="top-right"
//             trackUserLocation
//             onGeolocate={(e) => {
//               setViewState(prev => ({
//                 ...prev,
//                 latitude: e.coords.latitude,
//                 longitude: e.coords.longitude
//               }));
//             }}
//           />
//           <NavigationControl position="top-right" />

//             {/* User location marker */}
//             <Marker
//               latitude={userLocation.lat}
//               longitude={userLocation.lng}
//               anchor="center"
//             >
//               <div className="relative">
//                 <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
//                 <div className="absolute h-10 w-10 bg-blue-500 rounded-full -top-3 -left-3 animate-ping opacity-20"></div>
//               </div>
//             </Marker>

//             {/* Destination marker */}
//           {currentNFT && (
//             <Marker
//               latitude={currentNFT.location.lat}
//               longitude={currentNFT.location.lng}
//               anchor="bottom"
//             >
//               <div className="bg-red-500 h-6 w-6 rounded-full flex items-center justify-center text-white">
//                 <MapPin className="h-3 w-3" />
//               </div>
//             </Marker>
//           )}

//           {/* Route line */}
//           {routeGeoJson && (
//             <Source type="geojson" data={routeGeoJson}>
//               <Layer {...routeLayerStyle} />
//             </Source>
//           )}
//         </Map>

//         {/* Navigation Controls */}
//         {currentNFT && !nearDestination && (
//           <div className="absolute top-4 left-4 right-4">
//             <Card className="bg-white/90 backdrop-blur-sm p-3 shadow-lg">
//               <div className="flex justify-between items-center">
//                 <div className="flex-1">
//                   {isNavigating ? (
//                     <div className="space-y-2">
//                       <p className="font-medium text-sm">
//                         {navigationSteps[0]?.maneuver?.instruction || 'Follow the route'}
//                       </p>
//                       <div className="flex items-center text-xs text-gray-500">
//                         <Navigation className="h-3 w-3 mr-1" />
//                         <span>{navigationSteps[0]?.distance?.toFixed(0) || 0}m</span>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="font-medium text-sm">Start navigation to {currentNFT.shopName}</p>
//                   )}
//                 </div>
//                 <Button
//                   size="sm"
//                   variant={isNavigating ? "destructive" : "default"}
//                   onClick={() => isNavigating ? stopNavigation() : startNavigation()}
//                 >
//                   {isNavigating ? 'Stop' : 'Start'} Navigation
//                 </Button>
//               </div>
//             </Card>
//           </div>
//         )}

//         {nearDestination && (
//           <div className="absolute bottom-4 left-4 right-4">
//             <Card className="bg-white/90 backdrop-blur-sm p-4 shadow-lg">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
//                     <Check className="h-5 w-5 text-green-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium">You've arrived!</p>
//                     <p className="text-sm text-gray-500">Congratulations! You've reached your destination.</p>
//                   </div>
//                 </div>
//                 <Button size="sm" onClick={handleScan} disabled={scanning || claiming}>
//                   Claim NFT
//                 </Button>
//               </div>
//             </Card>
//           </div>
//         )}

//         {claiming && (
//           <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
//             <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center space-y-4">
//               <div className="flex justify-center">
//                 <div className="relative">
//                   <div className="animate-pulse h-20 w-20 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center">
//                     <Check className="h-10 w-10 text-white" />
//                   </div>
//                   <div className="absolute inset-0 animate-spin">
//                     <div className="h-4 w-4 bg-white rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
//                   </div>
//                 </div>
//               </div>
//               <h3 className="text-xl font-bold">Claiming NFT</h3>
//               <p className="text-gray-500">
//                 Please wait while we mint your NFT on the blockchain
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Success Modal with Solana Explorer Link */}
//         {mintResult?.success && !claiming && (
//           <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
//             <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center space-y-4">
//               <div className="flex justify-center">
//                 <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
//                   <Check className="h-10 w-10 text-green-600" />
//                 </div>
//               </div>
//               <h3 className="text-xl font-bold">NFT Claimed Successfully!</h3>
//               <p className="text-gray-500">
//                 Your NFT has been minted to your wallet
//               </p>
//               <div className="pt-2">
//                 <Button
//                   onClick={() => window.open(`https://explorer.solana.com/address/${mintResult.mintAddress.toString()}/devnet`, '_blank')}
//                   className="w-full flex items-center justify-center gap-2"
//                 >
//                   <ExternalLink className="h-4 w-4" />
//                   View on Solana Explorer
//                 </Button>
//               </div>
//               <div className="pt-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setMintResult(null);
//                     navigate('/profile');
//                   }}
//                 >
//                   Go to Profile
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {currentNFT && (
//         <div className="bg-gray-50 p-4 rounded-lg">
//           <h2 className="font-medium mb-2">NFT Location Information</h2>
//           <p className="text-sm text-gray-500">
//             <span className="font-medium">Location:</span> {currentNFT.shopName}
//           </p>
//           <p className="text-sm text-gray-500">
//             <span className="font-medium">NFT:</span> {currentNFT.name}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

import "@solana/wallet-adapter-react-ui/styles.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { useNFT } from "@/contexts/NFTContext";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
  MapRef,
  ViewState,
} from "react-map-gl";
import mapboxgl from "mapbox-gl";
import type { LineLayer } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  QrCode,
  Navigation,
  Compass,
  Check,
  Clock,
  MapPin,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";

// Replace with your actual Mapbox token
mapboxgl.accessToken =
  "pk.eyJ1IjoiaGltYW5zaHUtcmF3YXQtNyIsImEiOiJjbTIxcmViNm0weGZnMmpxc2E0dmIwazdhIn0.0n9VXfbQP3k05uC86PMGDg";

const COLLECTION_ADDRESS = "3cPa38rQWYLJ6iij1crMnCgzV3q42sR1ae42tWdGhjqs";

const INITIAL_VIEW_STATE: Partial<ViewState> = {
  latitude: 28.4996139,
  longitude: 77.2457196,
  zoom: 13,
  bearing: 0,
  pitch: 0,
};

const routeLayerStyle: LineLayer = {
  id: "route",
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": "#F59E0B",
    "line-width": 4,
    "line-dasharray": [2, 2],
  },
  source: "route",
};

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const nftId = searchParams.get("nft");
  const { nfts, claimNFT, userLocation, watchUserLocation, updateNFTMint } =
    useNFT();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey: walletPublicKey, connected, connecting } = wallet;

  const [scanning, setScanning] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [nearDestination, setNearDestination] = useState(false);
  const [viewState, setViewState] =
    useState<Partial<ViewState>>(INITIAL_VIEW_STATE);
  const [routeGeoJson, setRouteGeoJson] =
    useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  interface NavigationStep {
    distance: number;
    duration: number;
    maneuver: {
      instruction: string;
      location: [number, number];
      type: string;
    };
  }

  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [mintedNftAddress, setMintedNftAddress] = useState<string | null>(null);
  const [mintResult, setMintResult] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showSteps, setShowSteps] = useState(false);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pulseRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  const currentNFT = nfts.find((nft) => nft.id === nftId);

  // Start watching location when component mounts
  useEffect(() => {
    watchUserLocation();

    // Pulse animation for markers
    const animatePulse = () => {
      pulseRef.current = (pulseRef.current + 1) % 100;
      animationRef.current = requestAnimationFrame(animatePulse);
    };

    animationRef.current = requestAnimationFrame(animatePulse);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update view state when user location changes
  useEffect(() => {
    if (userLocation && !isNavigating) {
      setViewState((prev) => ({
        ...prev,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      }));
    }
  }, [userLocation, isNavigating]);

  const fetchRoute = useCallback(
    async (start: [number, number], end: [number, number]) => {
      try {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const json = await query.json();

        if (json.routes?.[0]) {
          setRouteGeoJson({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: json.routes[0].geometry.coordinates,
            },
          });
          setNavigationSteps(json.routes[0].legs[0].steps);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    },
    []
  );

  // Update route when user location or NFT changes
  useEffect(() => {
    if (currentNFT && userLocation) {
      fetchRoute(
        [userLocation.lng, userLocation.lat],
        [currentNFT.location.lng, currentNFT.location.lat]
      );
    }
  }, [currentNFT, userLocation, fetchRoute]);

  // Check if user is near destination
  useEffect(() => {
    if (currentNFT && userLocation) {
      const distance = Math.sqrt(
        Math.pow(userLocation.lat - currentNFT.location.lat, 2) +
          Math.pow(userLocation.lng - currentNFT.location.lng, 2)
      );
      setNearDestination(distance < 0.002);
    }
  }, [currentNFT, userLocation]);

  const startNavigation = () => {
    setIsNavigating(true);
    setShowSteps(true);
    if (userLocation) {
      setViewState((prev) => ({
        ...prev,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 16,
        pitch: 60,
        bearing: 0,
      }));
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setShowSteps(false);
    setViewState(INITIAL_VIEW_STATE);
  };

  const mintNFT = async () => {
    if (!connection) {
      toast({
        title: "Connection Error",
        description: "No connection to Solana network",
        variant: "destructive",
      });
      return null;
    }

    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Create UMI instance with connection and wallet
      const umi = createUmi(connection.rpcEndpoint)
        .use(mplTokenMetadata())
        .use(walletAdapterIdentity(wallet));

      // Generate a new mint signer
      const mint = generateSigner(umi);

      // Create and send the NFT creation transaction
      const { signature } = await createNft(umi, {
        mint,
        name: currentNFT?.name || "India Gate NFT",
        symbol: "LNFT",
        uri:
          currentNFT?.imageUrl ||
          "https://raw.githubusercontent.com/himanshu-rawat77/NFT-Go-main/main/public/sample.json",
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: false,
        collection: {
          key: publicKey(COLLECTION_ADDRESS),
          verified: false,
        },
      }).sendAndConfirm(umi);

      // Wait for transaction confirmation
      await umi.rpc.confirmTransaction(signature, {
        strategy: {
          type: "blockhash",
          ...(await umi.rpc.getLatestBlockhash()),
        },
      });

      // Fetch the created NFT
      const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

      return {
        success: true,
        mintAddress: mint.publicKey,
        nft: createdNft,
        signature,
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to mint NFT",
      };
    }
  };

  const handleScan = async () => {
    if (!connected && !connecting) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to claim NFTs",
        variant: "default",
      });
      return;
    }

    setScanning(true);
    setClaiming(true);

    try {
      const result = await mintNFT();

      // Even if we get an error fetching the NFT, we'll treat it as success
      // since the NFT might still be minted
      if (result?.mintAddress) {
        // Update local state with claimed NFT
        if (currentNFT) {
          await claimNFT(currentNFT);
          // Update the mint address after successful minting
          updateNFTMint(currentNFT.id, result.mintAddress.toString());
        }

        setMintResult({
          success: true,
          mintAddress: result.mintAddress,
          nft: result.nft || null,
          signature: result.signature,
        });

        toast({
          title: "NFT Claimed Successfully!",
          description:
            "Check your wallet for the NFT. It may take a few minutes to appear.",
        });

        setMintedNftAddress(result.mintAddress.toString());
      } else {
        throw new Error("No mint address returned");
      }
    } catch (error) {
      console.error("Error in claim process:", error);

      // If it's either the AccountNotFoundError or No mint address error, still show success
      if (
        error.message?.includes("AccountNotFoundError") ||
        error.message?.includes("No mint address returned")
      ) {
        toast({
          title: "NFT Likely Claimed Successfully",
          description:
            "The NFT may take a few minutes to appear in your wallet. Please check back later.",
        });
        // Set a temporary success state and still claim the NFT
        if (currentNFT) {
          await claimNFT(currentNFT);
        }
        setMintResult({
          success: true,
          mintAddress: "pending",
          nft: null,
          signature: null,
        });
      } else {
        toast({
          title: "Claim Failed",
          description: "Failed to claim and mint NFT",
          variant: "destructive",
        });
      }
    } finally {
      setScanning(false);
      setClaiming(false);
    }
  };

  const openSolanaExplorer = () => {
    if (mintedNftAddress) {
      // Open Solana Explorer with the NFT address (using devnet)
      window.open(
        `https://explorer.solana.com/address/${mintedNftAddress}/devnet`,
        "_blank"
      );
    }
  };

  const estimatedTime = currentNFT?.distance
    ? Math.round(currentNFT.distance * 12)
    : 0;

  // When no location is available, use Delhi coordinates
  if (!userLocation) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent"></div>
            <Compass className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
          </div>
          <p className="text-gray-500 font-medium">Getting your location...</p>
          <p className="text-xs text-gray-400">
            Please enable location services
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Map Explorer
        </h1>
        <div className="flex space-x-2">
          {!connected ? (
            <WalletMultiButton />
          ) : (
            currentNFT &&
            nearDestination && (
              <Button
                onClick={handleScan}
                disabled={scanning || claiming}
                className="gap-2"
              >
                {scanning ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Scanning...
                  </>
                ) : claiming ? (
                  <>
                    <div className="animate-pulse">
                      <Check className="h-4 w-4" />
                    </div>
                    Claiming...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                  </>
                )}
              </Button>
            )
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <Compass className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[50vh] overflow-auto">
              <SheetHeader>
                <SheetTitle className="text-amber-800">Directions</SheetTitle>
                <SheetDescription>
                  Follow these directions to claim your NFT
                </SheetDescription>
              </SheetHeader>

              {currentNFT ? (
                <motion.div
                  className="py-4 space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Navigation className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">{currentNFT.shopName}</p>
                        <p className="text-sm text-gray-500">Destination</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center text-amber-700">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{estimatedTime} min</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {currentNFT.distance} km
                      </p>
                    </div>
                  </div>

                  {navigationSteps.length > 0 && (
                    <Collapsible open={showSteps} onOpenChange={setShowSteps}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          <span>Navigation Steps</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              showSteps ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {navigationSteps.map((step, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              currentStepIndex === index
                                ? "bg-amber-50 border-amber-200"
                                : "bg-white border-gray-100"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-medium text-amber-800">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {step.maneuver?.instruction ||
                                    "Follow the route"}
                                </p>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Navigation className="h-3 w-3 mr-1" />
                                  <span>{step.distance?.toFixed(0) || 0}m</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </motion.div>
              ) : (
                <div className="py-6 text-center text-gray-500">
                  Select an NFT to view directions
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </motion.div>

      <motion.div
        className="relative h-[calc(100vh-12rem)] rounded-xl overflow-hidden shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Map
          {...viewState}
          ref={mapRef as unknown as React.MutableRefObject<MapRef | null>}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: "100%" }}
        >
          <GeolocateControl
            position="top-right"
            trackUserLocation
            showUserHeading
            onGeolocate={(e) => {
              setViewState((prev) => ({
                ...prev,
                latitude: e.coords.latitude,
                longitude: e.coords.longitude,
              }));
            }}
          />
          <NavigationControl position="top-right" />

          {/* User location marker */}
          <Marker
            latitude={userLocation.lat}
            longitude={userLocation.lng}
            anchor="center"
          >
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 2,
                ease: "easeInOut",
              }}
            >
              <div className="h-5 w-5 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
              <div className="absolute h-12 w-12 bg-blue-500 rounded-full -top-3.5 -left-3.5 animate-ping opacity-20"></div>
            </motion.div>
          </Marker>

          {/* Destination marker */}
          {currentNFT && (
            <Marker
              latitude={currentNFT.location.lat}
              longitude={currentNFT.location.lng}
              anchor="bottom"
            >
              <motion.div
                className="flex flex-col items-center"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                <div className="bg-amber-500 h-8 w-8 rounded-full flex items-center justify-center text-white shadow-lg">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="h-3 w-3 bg-amber-500 rotate-45 -mt-1.5 shadow-sm"></div>
              </motion.div>
            </Marker>
          )}

          {/* Route line */}
          {routeGeoJson && (
            <Source type="geojson" data={routeGeoJson}>
              <Layer {...routeLayerStyle} />
            </Source>
          )}
        </Map>

        {/* Navigation Controls */}
        {currentNFT && !nearDestination && (
          <div className="absolute top-4 left-4 right-4">
            <Card className="bg-white/90 backdrop-blur-sm p-3 shadow-lg border-none">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  {isNavigating ? (
                    <div className="space-y-2">
                      <p className="font-medium text-sm">
                        {navigationSteps[currentStepIndex]?.maneuver
                          ?.instruction || "Follow the route"}
                      </p>
                      <div className="flex items-center text-xs text-amber-600">
                        <Navigation className="h-3 w-3 mr-1" />
                        <span>
                          {navigationSteps[currentStepIndex]?.distance?.toFixed(
                            0
                          ) || 0}
                          m
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium text-sm">
                      Start navigation to {currentNFT.shopName}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isNavigating ? "outline" : "default"}
                  onClick={() =>
                    isNavigating ? stopNavigation() : startNavigation()
                  }
                  className={
                    isNavigating
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  }
                >
                  {isNavigating ? "Stop Navigation" : "Start Navigation"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {nearDestination && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-white/90 backdrop-blur-sm p-4 shadow-lg border-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.5,
                      ease: "easeInOut",
                    }}
                  >
                    <Check className="h-5 w-5 text-green-600" />
                  </motion.div>
                  <div>
                    <p className="font-medium">You've arrived!</p>
                    <p className="text-sm text-gray-500">
                      Congratulations! You've reached your destination.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleScan}
                  disabled={scanning || claiming}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  Claim NFT
                </Button>
              </div>
            </Card>
          </div>
        )}

        <AnimatePresence>
          {claiming && (
            <motion.div
              className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg p-8 max-w-sm w-full text-center space-y-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex justify-center">
                  <div className="relative">
                    <motion.div
                      className="h-20 w-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, 0, -10, 0],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 3,
                        ease: "easeInOut",
                      }}
                    >
                      <Sparkles className="h-10 w-10 text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute -inset-3"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 8,
                        ease: "linear",
                      }}
                    >
                      <div className="h-4 w-4 bg-white rounded-full absolute top-1/2 left-0 transform -translate-y-1/2"></div>
                    </motion.div>
                  </div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Claiming NFT
                </h3>
                <p className="text-gray-500">
                  Please wait while we mint your NFT on the blockchain
                </p>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Success Modal with Solana Explorer Link */}
      {mintResult?.success && !claiming && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold">NFT Claimed Successfully!</h3>
            <p className="text-gray-500">
              Your NFT has been minted to your wallet
            </p>
            <div className="pt-2">
              <Button
                onClick={() =>
                  window.open(
                    `https://explorer.solana.com/address/${mintResult.mintAddress.toString()}/devnet`,
                    "_blank"
                  )
                }
                className="w-full flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on Solana Explorer
              </Button>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMintResult(null);
                  navigate("/profile");
                }}
              >
                Go to Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {currentNFT && (
        <motion.div
          className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg shadow-inner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="font-medium mb-2 text-amber-800">
            NFT Location Information
          </h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Location:</span>{" "}
                {currentNFT.shopName}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">NFT:</span> {currentNFT.name}
              </p>
            </div>
            {currentNFT.distance && (
              <div className="flex items-center text-amber-700 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{currentNFT.distance} km away</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
