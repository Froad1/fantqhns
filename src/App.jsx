import React, { useEffect, useState } from 'react';
import MyMap from './components/MyMap/MyMap';
import MapWithMarkers from './components/MapWithMarkers/MapWithMarkers';

function App() {
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);

  useEffect(() => {
    if (navigator.geolocation) {
      const geoWatchID = navigator.geolocation.watchPosition((position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        console.log(position.coords.latitude, position.coords.longitude);
      });

      return () => {
        // Зупиняємо слідкування за геолокацією при розмонтажі компонента
        navigator.geolocation.clearWatch(geoWatchID);
      };
    }
    else{
      console.log("Геолока не надана");
    }
  }, []);

  return (
    <div>
      <h1>My Location Map</h1>
      {lat !== 0 && lng !== 0 ? (
        <div>
          <MapWithMarkers position={[lat, lng]} />
        </div>
        
      ) : (
        <div>Координати не знайдено</div>
      )}
    </div>
  );
}

export default App;
