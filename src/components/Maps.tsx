import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import car from '../assets/car.png';
import flag from '../assets/flag.png';

const myIcon = new L.Icon({
  iconUrl: car,
  iconRetinaUrl: car,
  popupAnchor: [-0, -0],
  iconSize: [30, 30],
  className: 'w-8 h-8 lg:w-15 lg:h-15', // Responsive sizes
});

const myIcon2 = new L.Icon({
  iconUrl: flag,
  iconRetinaUrl: flag,
  popupAnchor: [-0, -0],
  iconSize: [30, 30],
  className: 'w-8 h-8 lg:w-15 lg:h-15', // Responsive sizes
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
};

const MovingMarker = ({ positions, isMoving, onRouteComplete }) => {
  const [currentPosition, setCurrentPosition] = useState(positions[0]);
  const [routePoints, setRoutePoints] = useState([]);
  const map = useMap();

  useEffect(() => {
    if (!isMoving || positions.length < 2) return;

    let routingControl;
    
    const setupRoute = async () => {
      const waypoints = positions.map(pos => L.latLng(pos[0], pos[1]));

      routingControl = L.Routing.control({
        waypoints: waypoints,
        lineOptions: {
          styles: [{ color: '#6FA1EC', weight: 4 }]
        },
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        showAlternatives: false
      }).addTo(map);

      routingControl.on('routesfound', (e) => {
        const coordinates = [];
        e.routes[0].coordinates.forEach(point => {
          coordinates.push([point.lat, point.lng]);
        });
        setRoutePoints(coordinates);
        startAnimation(coordinates);
      });
    };

    setupRoute();

    return () => {
      if (routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [isMoving, positions, map]);

  const startAnimation = (routePoints) => {
    let currentIndex = 0;
    const animationSpeed = 50;

    const animate = () => {
      if (currentIndex >= routePoints.length) {
        onRouteComplete?.();
        return;
      }

      setCurrentPosition(routePoints[currentIndex]);
      currentIndex++;

      setTimeout(() => {
        requestAnimationFrame(animate);
      }, animationSpeed);
    };

    animate();
  };

  return currentPosition ? (
    <Marker position={currentPosition} icon={myIcon}>
      <Popup>Following route</Popup>
    </Marker>
  ) : null;
};

const Maps = ({ center, zoom, radius, onMapClick, destinations = [], isNavigating = false, onRouteComplete }) => {
  const circleOptions = {
    color: 'blue',
    fillColor: '#2196f3',
    fillOpacity: 0,
    weight: 2,
  };

  const fullRoute = isNavigating ? [
    center,
    ...destinations.map(dest => [dest.lat, dest.lng]),
    center
  ] : [];

  return (
    <div className="h-[70vh] w-full lg:h-screen">
      <MapContainer 
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ChangeView center={center} zoom={zoom} />
        <MapClickHandler onMapClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={3}
        />
        
        {!isNavigating && (
          <>
            <Marker position={center} icon={myIcon}>
              <Popup>Current Location</Popup>
            </Marker>
            {destinations.map((dest, index) => (
              <Marker 
                key={dest.id} 
                position={[dest.lat, dest.lng]} 
                icon={myIcon2}
              >
                <Popup>Destination {index + 1}</Popup>
              </Marker>
            ))}
          </>
        )}

        {isNavigating && (
          <MovingMarker 
            positions={fullRoute}
            isMoving={isNavigating}
            onRouteComplete={onRouteComplete}
          />
        )}

        <Circle 
          center={center}
          radius={radius}
          pathOptions={circleOptions}
        />
      </MapContainer>
    </div>
  );
};

export default Maps;
