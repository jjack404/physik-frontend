import React, { useState, useEffect, useContext, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { WalletContext } from '../context/WalletContext';
import LootForm from './LootForm';
import './Map.css';
import axios from 'axios';
import pepeIcon from '../assets/pepe.png'; // Import the custom icon

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 90px)', // Subtract the height of the top and bottom bars
};

const center = {
  lat: 0,
  lng: 0,
};

// Define your custom map styles
const mapStyles = [
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "saturation": 0
      },
      {
        "color": "#020919"
      },
      {
        "lightness": 100
      }
    ]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "visibility": "on"
      },
      {
        "color": "#020919"
      },
      {
        "lightness": 0
      },
      {
        "weight": 2.3
      }
    ]
  },
  {
    "featureType": "all",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#020919"
      },
      {
        "lightness": 100
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#020919"
      },
      {
        "lightness": 17
      },
      {
        "weight": .5
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fffbbd"
      },
      {
        "lightness": 50
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fffbbd"
      },
      {
        "lightness": 21
      },
      {
        "saturation": 25
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#fffbbd"
      },
      {
        "lightness": -10
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#5bef6a"
      },
      {
        "lightness": 0
      },
      {
        "weight": 0.3
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#020919"
      },
      {
        "lightness": 50
      },
      {
        "weight": 0.2
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#020919"
      },
      {
        "lightness": 66
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#5bef6a"
      },
      {
        "lightness": 100
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#020919"
      },
      {
        "lightness": 25
      },
      {
        "saturation": -50
      }
    ]
  }
];

const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

const Map = () => {
  const { walletAddress } = useContext(WalletContext);
  const [markers, setMarkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formPosition, setFormPosition] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Fetch existing drops from the backend
    const fetchDrops = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/drops`);
        setMarkers(response.data);
      } catch (error) {
        console.error('Error fetching drops:', error);
      }
    };

    fetchDrops();
  }, []);

  const handleMapClick = (event) => {
    if (isMobileDevice() && walletAddress) {
      setTooltipPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    } else {
      setTooltipPosition(null);
    }
  };

  const handleMapRightClick = (event) => {
    if (!isMobileDevice() && walletAddress) {
      const map = mapRef.current;
      const scale = Math.pow(2, map.getZoom());
      const nw = new window.google.maps.LatLng(
        map.getBounds().getNorthEast().lat(),
        map.getBounds().getSouthWest().lng()
      );
      const worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
      const worldCoordinate = map.getProjection().fromLatLngToPoint(event.latLng);
      const pixelOffset = new window.google.maps.Point(
        Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
        Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
      );

      setTooltipPosition({ x: pixelOffset.x, y: pixelOffset.y });
      setFormPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      setShowForm(true); // Show the form
      setTooltipPosition(null); // Hide the tooltip
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormPosition(null);
  };

  const handleSubmitForm = async (data) => {
    const newMarker = {
      ...data,
      position: formPosition,
      walletAddress,
    };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/drops`, newMarker, {
        headers: { 'wallet-address': walletAddress },
      });
      setMarkers((prevMarkers) => [...prevMarkers, response.data]);
      handleCloseForm();
    } catch (error) {
      console.error('Error saving drop:', error);
    }
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2}
        onClick={handleMapClick}
        onRightClick={handleMapRightClick}
        onLoad={(map) => (mapRef.current = map)}
        options={{ styles: mapStyles, fullscreenControl: false }}
        className="map-container"
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={{
              url: pepeIcon,
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        ))}
        {tooltipPosition && (
          <div
            className="tooltip"
            style={{
              position: 'absolute',
              top: `${tooltipPosition.y}px`,
              left: `${tooltipPosition.x}px`,
              backgroundColor: 'white',
              padding: '5px',
              borderRadius: '5px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            }}
          >
            <button onClick={() => setShowForm(true)}>Add Loot</button>
          </div>
        )}
        {showForm && (
          <LootForm
            position={formPosition}
            onClose={handleCloseForm}
            onSubmit={handleSubmitForm}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
