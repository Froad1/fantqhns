import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import classes from './Room.module.css'
import MyButton from '../../components/UI/MyButton/MyButton';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

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

const Room = () => {
    const { roomId } = useParams();
    const [roomData, setRoomData] = useState([]);
    const [user, setUser] = useState([]);
    const [position, setPosition] = useState([])
    const [readyStatus, setReadyStatus] = useState(false);
    const navigate = useNavigate();
    const db = firebase.firestore();

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            }
        })
    }, [])

    useEffect(() => {
        getRoomData();
    }, [])

    const getRoomData = () => {
        const docRef = db.collection('rooms').doc(roomId);

        const unsubscribe = docRef.onSnapshot((doc) => {
            if (doc.exists) {
                setRoomData(doc.data());
            } else {
                console.log('Документ не існує');
            }
        });

        return () => {
            unsubscribe();
        };
    }

    useEffect(() => {
        if (roomData.length != 0) {
            checkPlayerInRoom();
        }
    }, [roomData])

    const getPosition = () =>{
        if (navigator.geolocation) {
            const geoWatchID = navigator.geolocation.watchPosition((position) => {
                setPosition({latitude: position.coords.latitude, longitude: position.coords.longitude})
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
    }

    const checkPlayerInRoom = () => {
        if (user.uid) {
            const objectWithIdExists = roomData.users.some(item => item.id === user.uid)

            if (objectWithIdExists) console.log("Є");
            else {
                getPosition()
                const newObject = {
                    id: user.uid,
                    location: position,
                    ready: false,
                    color: '#20a7f5',
                };

                const docRef = db.collection('rooms').doc(roomId)

                docRef.update({
                    users: firebase.firestore.FieldValue.arrayUnion(newObject)
                })
            }
        }
        else {
            console.log("Не зареєстровані");
        }
    }

    const changeReadyStatus = () => {
        const docRef = db.collection('rooms').doc(roomId)
        if (readyStatus) {

            docRef.get().then((doc) => {
                if (doc.exists) {
                    const roomData = doc.data();
                    const users = roomData.users;

                    // Знайдіть об'єкт з ID '32r3r2234' і оновіть поле 'ready'
                    const updatedUsers = users.map((userF) => {
                        if (userF.id === user.uid) {
                            return { ...userF, ready: false };
                        }
                        return userF;
                    });

                    // Оновіть документ зі зміненими даними
                    docRef.update({ users: updatedUsers });
                    setReadyStatus(false);
                }
            });
        }
        else if (!readyStatus) {
            docRef.get().then((doc) => {
                if (doc.exists) {
                    const roomData = doc.data();
                    const users = roomData.users;

                    // Знайдіть об'єкт з ID '32r3r2234' і оновіть поле 'ready'
                    const updatedUsers = users.map((userF) => {
                        if (userF.id === user.uid) {
                            return { ...userF, ready: true };
                        }
                        return userF;
                    });

                    // Оновіть документ зі зміненими даними
                    docRef.update({ users: updatedUsers });
                    setReadyStatus(true);
                }
            });
        }
    }

    const back = () => {
        navigate(-1);
    }

    return (
        <div className={classes.room_page_container}>
            <svg onClick={back} className={classes.back_icon} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
            <div className={classes.users_list_container}>
                <h3>Список гравців:</h3>
                <div className={classes.users_list}>
                    {roomData?.users?.map((user) => (
                        <div key={user.id} className={classes.user}>
                            <div className={classes.ready_point} style={user.ready ? { background: '#62FF48' } : { background: '#FD3A3A' }}></div>
                            <p>{user.id}</p>
                        </div>
                    ))

                    }
                </div>
            </div>

            <MyButton onClick={changeReadyStatus} style={{ background: '#C7B8EA' }}>Готовий</MyButton>
            <p>ID Кімнати:</p>
            <div>{roomId}</div>
        </div>
    );
};

export default Room;