import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNFTRetail } from '../hooks/useNFTRetail';

// Replace with your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiaGltYW5zaHUtcmF3YXQtNyIsImEiOiJjbTIxcmViNm0weGZnMmpxc2E0dmIwazdhIn0.0n9VXfbQP3k05uC86PMGDg';

interface NFTMapProps {
  onShopSelect?: (shopAddress: string) => void;
}

export const NFTMap: React.FC<NFTMapProps> = ({ onShopSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { getShops } = useNFTRetail();
  const [shops, setShops] = useState<any[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40], // Default center (New York)
      zoom: 9
    });

    // Clean up on unmount
    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    const loadShops = async () => {
      const shopData = await getShops();
      setShops(shopData);

      if (!map.current) return;

      // Add markers for each shop
      shopData.forEach((shop: any) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([shop.location.longitude, shop.location.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <h3>${shop.name}</h3>
                <button onclick="window.selectShop('${shop.address}')">
                  Select Shop
                </button>
              `)
          )
          .addTo(map.current!);
      });

      // If we have shops, fit the map to show all markers
      if (shopData.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        shopData.forEach((shop: any) => {
          bounds.extend([shop.location.longitude, shop.location.latitude]);
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }
    };

    loadShops();
  }, [getShops]);

  // Add the shop selection function to the window object
  useEffect(() => {
    (window as any).selectShop = (shopAddress: string) => {
      onShopSelect?.(shopAddress);
    };

    return () => {
      delete (window as any).selectShop;
    };
  }, [onShopSelect]);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
}; 