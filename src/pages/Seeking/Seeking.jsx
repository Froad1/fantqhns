import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Seeking.css'

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

const Seeking = () => {
    const { roomId } = useParams();
    const [position, setPosition] = useState(null);
    const [user, setUser] = useState(null);
    const [destinationLocations, setDestinationLocations] = useState(null);
    const [radiusHiding, setRadiusHiding] = useState(100);
    const [circleLocation, setCircleLocation] = useState(null);
    const [centerField, setCenterField] = useState([49.190199, 16.593468]);
    const [radiusField, setRadiusField] = useState(1000);
    const [warningZone, setWarningZone] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            }
        })
    }, [])

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
        var i = 10;
        setInterval(()=>{
            if(i>=0){
                setTimer(i);
                i--;
                if(i === 0 ){
                    setGameStarted(true);
                    getCenterField()
                }
            }
        },10)
        
    },[])

    useEffect(()=>{
        if(user){
            getPlayersPosition();
        }
    },[user]);

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

            if (closestLocation && closestDistance < (radiusHiding/1000)) {
                setCircleLocation(closestLocation);
            } else {
                setCircleLocation(null);
            }
        }
    }, [position, destinationLocations]);

    const checkOutField = () => {
        const distance = getDistance(position[0], position[1], centerField[0], centerField[1]);

        if (distance > radiusField / 1000) {
            setWarningZone(true);
            console.log("ВИ НЕ В ЗОНІ");

        }
        else{
            setWarningZone(false);
        }
    }

    const getPlayersPosition = () => {
        const db = firebase.firestore();
        const docRef = db.collection('rooms').doc(roomId);

        const unsubscribe = docRef.onSnapshot((doc) => {
            if (doc.exists) {
                var locationsArray = [];
                doc.data().users.map((userF) => {
                    if(userF.id != user.uid){
                        var location = userF.location
                        locationsArray.push([location.latitude, location.longitude])
                    }
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
    const getCenterField = () => {
        const db = firebase.firestore();
        const docRef = db.collection('rooms').doc(roomId);
        const unsubscribe = docRef.onSnapshot((doc) => {
            if (doc.exists) {
                var centerField = doc.data().settings.centerField;
                setCenterField([centerField.latitude, centerField.longitude]);
                // console.log(centerField);
                checkOutField()
            } else {
                console.log('Документ не існує');
            }
        });
        return () => {
            unsubscribe();
        };

    }

    const back = () => {
        navigate(-1);
    }

    useEffect(()=>{
        console.log(destinationLocations);
    },[destinationLocations])

    return (
        <div className='seeking_container'>
            {warningZone && (
                <div className='warning_zone'>
                    <h1>ВИ ЗА ЗОНОЮ</h1>
                    <h2>Поверніться до зони</h2>
                </div>
            )}
            {gameStarted ?
                (position ? (
                    <>
                        <div onClick={back}  className='back'>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
                        </div>
                        <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            <Marker position={position}>
                                <Popup>
                                    Your Location
                                    {position?.map((loc) => (
                                        <div key={loc}>{loc}</div>
                                    ))}
                                </Popup>
                            </Marker>
                            {/* <Circle center={position} radius={radiusHiding} className='field_circle'>

                            </Circle> */}
                            {destinationLocations?.map((destination, index) => (
                                circleLocation && destination === circleLocation && (
                                    <Circle key={index} center={[destination[0] + (Math.random() * 0.0023), destination[1] + (Math.random() * 0.0023)]} radius={radiusHiding}>
                                        <Popup>
                                            Position {destination.map((loc) => (
                                                <div key={loc}>{loc}</div>
                                            ))}
                                        </Popup>
                                    </Circle>
                                )
                            ))}
                            <Circle center={centerField} radius={radiusField} className='field_circle'>
                            </Circle>
                        </MapContainer>
                    </>
                ) : (
                    <p>Loading map...</p>
                )):(
                    <div className='timer'>
                        <h1>{timer}</h1>
                    </div>
                )
            }
        </div>
    );

}

export default Seeking;
