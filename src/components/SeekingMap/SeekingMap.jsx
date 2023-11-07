import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './SeekingMap.css'

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBr9tJ_kpF95qefrcpchFBiV-wuxsacoGU",
    authDomain: "fantqhns.firebaseapp.com",
    projectId: "fantqhns",
    storageBucket: "fantqhns.appspot.com",
    messagingSenderId: "22208453528",
    appId: "1:22208453528:web:3c6b75d06b8a1ccd6469ed",
    measurementId: "G-JY768BVBB8"
};
firebase.initializeApp(firebaseConfig);

const SeekingMap = () => {
    const { roomId } = useParams();
    const [position, setPosition] = useState(null);
    const [destinationLocations, setDestinationLocations] = useState(null);
    const [circleLocation, setCircleLocation] = useState(null);
    const [centerField, setCenterField] = useState([49.190199, 16.593468]);
    const [radiusField, setRadiusField] = useState(2000);

    useEffect(() => {
        if (navigator.geolocation) {
            const geoWatchID = navigator.geolocation.watchPosition((position) => {
                setPosition([position.coords.latitude, position.coords.longitude])
            });

            return () => {
                // Зупиняємо слідкування за геолокацією при розмонтажі компонента
                navigator.geolocation.clearWatch(geoWatchID);
            };
        }
        else {
            console.log("Геолока не надана");
        }
    }, []);

    useEffect(()=>{
        getPlayersPosition();
    },[])

    useEffect(() => {
        if (position) {
            checkOutField();
        }
    }, [position])


    function getDistance(lat1, lon1, lat2, lon2) {
        const radLat1 = (Math.PI * lat1) / 180;
        const radLat2 = (Math.PI * lat2) / 180;
        const dLat = radLat2 - radLat1;
        const dLon = (Math.PI * lon2 - Math.PI * lon1) / 180;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const R = 6371;

        const distance = R * c;

        return distance;
    }

    useEffect(() => {
        if (position && destinationLocations) {
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
        }
    }, [position, destinationLocations]);

    const checkOutField = () => {
        const distance = getDistance(position[0], position[1], centerField[0], centerField[1]);

        if (distance > radiusField / 1000) {

            console.log("ВИ НЕ В ЗОНІ");
        }
    }

    const getPlayersPosition = () => {
        const db = firebase.firestore();
        const docRef = db.collection('rooms').doc(roomId);

        const unsubscribe = docRef.onSnapshot((doc) => {
            if (doc.exists) {
                var locationsArray = [];
                doc.data().users.map((user) => {
                    var location = user.location
                    locationsArray.push([location.latitude, location.longitude])
                })
                setDestinationLocations(locationsArray);
            } else {
                console.log('Документ не існує');
            }
        });

        return () => {
            unsubscribe();
        };
    }

    return (
        <div>
            {position ? (
                <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                            Your Location
                            {position?.map((loc) => (
                                <div key={loc}>{loc}</div>
                            ))}
                        </Popup>
                    </Marker>
                    {destinationLocations?.map((destination, index) => (
                        circleLocation && destination === circleLocation && (
                            <Circle key={index} center={destination} radius={200}>
                                <Popup>
                                    Position {destination.map((loc) => (
                                        <div key={loc}>{loc}</div>
                                    ))}
                                </Popup>
                            </Circle>
                        )
                    ))}

                    {destinationLocations?.map((destination, index) => (
                        <Marker key={index} position={destination}>
                        </Marker>
                    ))}
                    <Circle center={centerField} radius={radiusField} className='field_circle'>
                    </Circle>
                </MapContainer>
            ) : (
                <p>Loading map...</p>
            )}
        </div>
    );

}

export default SeekingMap;
