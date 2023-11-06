import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapWithMarkers.css'

const MapWithMarkers = ({ position }) => {
    const [destinationLocations, setDestinationLocations] = useState([]);
    const [circleLocation, setCircleLocation] = useState(null);
    const [centerField, setCenterField] = useState([49.190199, 16.593468]);
    const [radiusField, setRadiusField] = useState(2000);

    useEffect(() => {
        setDestinationLocations([
            [49.194911, 16.573983],
            [49.189749, 16.601020],
            // Додайте інші мітки сюди
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

    useEffect(() => {
        let closestLocation = null;
        let closestDistance = Infinity;

        destinationLocations.forEach(destination => {
            const distance = getDistance(position[0], position[1], destination[0], destination[1]);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestLocation = destination;
            }
        });

        if (closestLocation && closestDistance < 0.20) {
            setCircleLocation(closestLocation);
        } else {
            setCircleLocation(null);
        }
    }, [position, destinationLocations]);

    const checkOutField = () =>{
        const distance = getDistance(position[0], position[1], centerField[0], centerField[1]);
        console.log("Дистанція", distance);

        if(distance > radiusField/1000){
            
            console.log("ВИ НЕ В ЗОНІ");
        }
    }

    useEffect(()=>{
        checkOutField();
    },[position])

    return (
        <div>
            {/* Ваші кнопки для зміни розташування тут */}
            <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position}>
                    <Popup>
                        Your Location
                        {position.map((loc) => (
                            <div key={loc}>{loc}</div>
                        ))}
                    </Popup>
                </Marker>
                {destinationLocations.map((destination, index) => (
                    circleLocation && destination === circleLocation ? (
                        <Circle key={index} center={destination} radius={200}>
                            <Popup>
                                Position {destination.map((loc) => (
                                    <div key={loc}>{loc}</div>
                                ))}
                            </Popup>
                        </Circle>
                    ) : (
                        <div key={index}>
                            {/* <Marker  position={destination}>
                                <Popup>
                                    Position {destination.map((loc) => (
                                        <div key={loc}>{loc}</div>
                                        </Popup>
                                    ))}
                            </Marker> */}
                        </div>
                    )
                ))}
                <Circle center={centerField} radius={radiusField} className='field_circle'>
                    
                </Circle>
            </MapContainer>
        </div>
    );
}

export default MapWithMarkers;
