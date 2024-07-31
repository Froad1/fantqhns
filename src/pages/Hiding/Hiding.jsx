import React, { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import './Hiding.css'

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useParams } from 'react-router';

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

const Hiding = () => {
    const { roomId } = useParams();
    const [position, setPosition] = useState(null);
    const [user, setUser] = useState([]);
    const [centerField, setCenterField] = useState([49.190199, 16.593468]);
    const [radiusField, setRadiusField] = useState(1000);
    const [warningZone, setWarningZone] = useState(false);
    const db = firebase.firestore();

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                console.log(user);
            }
        })
    }, [])


    useEffect(() => {
        getCenterField();
        if (navigator.geolocation) {
            const geoWatchID = navigator.geolocation.watchPosition((position) => {
                setPosition([position.coords.latitude, position.coords.longitude])
            });

            return () => {
                navigator.geolocation.clearWatch(geoWatchID);
            };
        }
        else {
            console.log("Геолока не надана");
        }
    }, []);

    useEffect(() => {
        if (position) {
            checkOutField();
            changeLocationFirebase();
            console.log(position);
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

    const checkOutField = () => {
        const distance = getDistance(position[0], position[1], centerField[0], centerField[1]);

        if (distance > radiusField / 1000) {
            setWarningZone(true);
            console.log("ВИ НЕ В ЗОНІ");

        }
        else {
            setWarningZone(false);
        }
    }

    const changeLocationFirebase = () =>{
        const docRef = db.collection('rooms').doc(roomId);
        
        if(user){
            docRef.get().then((doc) => {
                if (doc.exists) {
                    const roomData = doc.data();
                    const users = roomData.users;

                    const updatedUsers = users.map((userF) => {
                        if (userF.id === user.uid) {
                            return { ...userF, location: {latitude: position[0], longitude: position[1] } };
                        }
                        return userF;
                    });

                    // Оновіть документ зі зміненими даними
                    docRef.update({ users: updatedUsers });
                }
            });
        }
    }

    const getCenterField = () => {
        const db = firebase.firestore();
        const docRef = db.collection('rooms').doc(roomId);
        const unsubscribe = docRef.onSnapshot((doc) => {
            if (doc.exists) {
                var centerField = doc.data().settings.centerField;
                setCenterField([centerField.latitude, centerField.longitude]);
                console.log(centerField);
                checkOutField()
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
            {warningZone && (
                <div className='warning_zone'>
                    <h1>ВИ ЗА ЗОНОЮ</h1>
                    <h2>Поверніться до зони</h2>
                </div>
            )}
            {position ? (
                <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={position}>
                        <Popup>
                            Your Location
                            {position?.map((loc) => (
                                <div key={loc}>{loc}</div>
                            ))}
                        </Popup>
                    </Marker>
                    <Circle center={centerField} radius={radiusField} className='field_circle'></Circle>
                </MapContainer>
            ):(
                <p>Loading map...</p>
            )}
        </div>
    );
};

export default Hiding;