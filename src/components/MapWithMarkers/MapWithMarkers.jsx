import React, { Component, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapWithMarkers = ({ position }) => {
    const [destinationLocations, setDestinationLocations] = useState([]);
    const [circleRadius, setCircleRadius] = useState(200);
    const [seeCircle, setSeeCircle] = useState(false);

    useEffect(() => {
        setDestinationLocations([
            [49.194911, 16.573983],
            [49.189749, 16.601020],
        ]);
    }, []);

    function getDistance(lat1, lon1, lat2, lon2) {
        const radLat1 = (Math.PI * lat1) / 180;
        const radLat2 = (Math.PI * lat2) / 180;
        const dLat = radLat2 - radLat1;
        const dLon = (Math.PI * lon2 - Math.PI * lon1) / 180;
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(radLat1) * Math.cos(radLat2) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        // Радіус Землі в кілометрах (приблизно)
        const R = 6371;
        
        // Відстань в кілометрах
        const distance = R * c;
        
        return distance;
    }
    
    const tesst = () => {
        const distances = destinationLocations.map(destination => {
            const distance = getDistance(position[0], position[1], destination[0], destination[1]);
            return distance;
        });
    
        const hasCloseDestination = distances.some(distance => distance < 0.30);
    
        setSeeCircle(hasCloseDestination);
        console.log(distances);
    }
    

    
    const changeLocationRight = () => {
        const locBuffer = destinationLocations.map(loc => {
            const newLocation = [...loc]; // Створюємо копію розташування
            newLocation[1] = newLocation[1] + 0.001;
            return newLocation;
        });
    
        setDestinationLocations(locBuffer);
    }
    const changeLocationLeft = () => {
        const locBuffer = destinationLocations.map(loc => {
            const newLocation = [...loc]; // Створюємо копію розташування
            newLocation[1] = newLocation[1] - 0.001;
            return newLocation;
        });
    
        setDestinationLocations(locBuffer);
    }
    
    const changeLocationDown = () => {
        const locBuffer = destinationLocations.map(loc => {
            const newLocation = [...loc]; // Створюємо копію розташування
            newLocation[0] = newLocation[0] - 0.001;
            return newLocation;
        });
    
        setDestinationLocations(locBuffer);
    }
    const changeLocationUp = () => {
        const locBuffer = destinationLocations.map(loc => {
            const newLocation = [...loc]; // Створюємо копію розташування
            newLocation[0] = newLocation[0] + 0.001;
            return newLocation;
        });
    
        setDestinationLocations(locBuffer);
    }
    

    return (
        <div>
            <div>                
            <button onClick={changeLocationLeft}>Left</button>
            <button onClick={changeLocationRight}>Right</button>
            <button onClick={changeLocationUp}>Up</button>
            <button onClick={changeLocationDown}>Down</button>
            </div>
            <button onClick={tesst}>Get Location</button>

            <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position}>
                    <Popup>
                        Your Location
                        {position.map((loc)=>(
                                    <div key={loc}>{loc}</div>
                                ))}
                    </Popup>
                </Marker>
                {destinationLocations.map((destination, index) => (
                    seeCircle ? (
                        <Circle key={index} center={destination} radius={circleRadius}>
                            <Popup>
                                Position {destination.map((loc)=>(
                                    <div key={loc}>{loc}</div>
                                ))}
                            </Popup>
                        </Circle>
                    ):(
                        <Marker key={index} position={destination}>
                            <Popup>
                                Position {destination.map((loc)=>(
                                    <div key={loc}>{loc}</div>
                                ))}
                            </Popup>
                        </Marker>
                    )


                ))}
            </MapContainer>
        </div>

    );
}

export default MapWithMarkers;
