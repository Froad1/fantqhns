import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import classes from './Room.module.css'
import MyButton from '../../components/UI/MyButton/MyButton';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { Link } from 'react-router-dom';
import { Modal } from '@mui/material';
import MyModal from '../../components/UI/MyModal/MyModal';
import MyInput from '../../components/UI/MyInput/MyInput';

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
    const [admin, setAdmin] = useState(false);
    const { roomId } = useParams();
    const [roomData, setRoomData] = useState([]);
    const [user, setUser] = useState([]);
    const [readyStatus, setReadyStatus] = useState(false);
    const [readyButtonText, setReadyButtonText] = useState("Готовий");
    const [seekingId, setSeekingId] = useState(null);
    const [settingsModal, setSettingsModal] = useState(false);
    const navigate = useNavigate();
    const db = firebase.firestore();

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                if(user.uid == 'PkwdudbBl2PMWHShdFZgPAgmEkN2'){
                    setAdmin(true);
                }
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
            checkAllReady();
        }
    }, [roomData])


    const checkAllReady = () => {
        const allReady = roomData.users.every(user => user.ready === true);

        const docRef = db.collection('rooms').doc(roomId);

        if (allReady) {
            console.log("ALL READY");


            var usersId = [];

            roomData.users.map((u) => {
                usersId.push(u.id);
            })

            var randomID

            if(admin){
                randomID = usersId[Math.floor(Math.random() * usersId.length)];
            }

            console.log(randomID);


            docRef.update({
                seeking: randomID
            })


            var i = 10;
            setInterval(() => {
                if (i != -1 && allReady) {
                    setReadyButtonText(i);
                    i--;
                }
                else return
            }, 1000)
            if( i == 0 && allReady){
                if(user.uid = randomID){
                    navigate()
                }
            }
        } else {
            clearInterval()
            docRef.update({
                seeking: ""
            })
        }
    }



    const checkPlayerInRoom = () => {
        if (user.uid) {
            const objectWithIdExists = roomData.users.some(item => item.id === user.uid)

            if (objectWithIdExists) console.log("Є");
            else {
                pushPlayerInRoom();
            }
        }
        else {
            console.log("Не зареєстровані");
        }
    }

    const pushPlayerInRoom = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                var userLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude }


                const newObject = {
                    id: user.uid,
                    location: userLocation,
                    ready: false,
                    color: '#20a7f5',
                };

                const docRef = db.collection('rooms').doc(roomId)

                docRef.update({
                    users: firebase.firestore.FieldValue.arrayUnion(newObject)
                })
            });
        }
        else {
            console.log("Геолока не надана");
        }
    }

    const changeReadyStatus = () => {
        const docRef = db.collection('rooms').doc(roomId);
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
                    setReadyButtonText("Готовий");
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
                    setReadyButtonText("Не готовий");
                }
            });
        }
    }

    const back = () => {
        navigate(-1);
    }

    const openSettings = () =>{
        if(admin){
            setSettingsModal(!settingsModal);
        }
    }

    const setSettingsLocation = () => {
        if (admin) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    var userLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
                    console.log(userLocation);
                    const center = new firebase.firestore.GeoPoint(userLocation.latitude, userLocation.longitude);
                    console.log(center);


                    const db = firebase.firestore();
                    const roomRef = db.collection('rooms').doc(roomId);

                    roomRef.update({
                      settings: {
                        ...roomData.settings, // збережіть існуючі дані
                        centerField: center,
                      },
                    })
                    .then(() => {
                      console.log('Місцеположення оновлено успішно');
                    })
                    .catch((error) => {
                      console.error('Помилка оновлення місцеположення:', error);
                    });
                });
            } else {
                console.log("Геолока не надана");
            }
        }
    };

    return (
        <div className={classes.room_page_container}>
            <div onClick={back}  className={classes.back}>
                <svg className={classes.back_icon} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" /></svg>
            </div>
            <div onClick={openSettings} className={classes.settings}>
                <svg className={classes.settings_icon} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm0-80q-25 0-42.5-17.5T422-480q0-25 17.5-42.5T482-540q25 0 42.5 17.5T542-480q0 25-17.5 42.5T482-420Zm-2-60Zm-40 320h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Z"/></svg>
            </div>
            <div className={classes.users_list_container}>
                <h3>Список гравців:</h3>
                <div className={classes.users_list}>
                    {roomData?.users?.map((user) => (
                        <div key={user.id} className={classes.user}>
                            <div className={classes.ready_point} style={user.ready ? { background: '#62FF48' } : { background: '#FD3A3A' }}></div>
                            <p style={roomData.seeking == user.id ? { color: 'red' } : {}}>{user.id}</p>
                        </div>
                    ))

                    }
                </div>
            </div>

            <MyButton onClick={changeReadyStatus} style={{ background: '#C7B8EA', width: '70% ' }}>{readyButtonText}</MyButton>
            <p>ID Кімнати:</p>
            <div>{roomId}</div>
            <Link to={`/map/seeking/${roomId}`}>Seeking Map</Link>
            <Link to={`/map/hiding/${roomId}`}>Hiding Map</Link>
            <p>{user.uid || user.id || "Немає"}</p>
            {/* <Modal
                open={settingsModal}
                onClose={() => setSettingsModal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div className={classes.modal_settings_container}>
                    <div className={classes.modal_content}>
                        <h2 id="modal-modal-title">Налаштування кімнати</h2>
                        <MyButton>Змінити геолокацію центра</MyButton>
                    </div>
                </div>
            </Modal> */}
            <MyModal visible={settingsModal} setVisible={()=>{setSettingsModal(!settingsModal)}}>
                <div className={classes.modal_settings_container}>
                    <div className={classes.modal_content}>
                        <h2 id="modal-modal-title">Налаштування кімнати</h2>
                        <MyInput>
                            Час на ховання
                        </MyInput>
                        <MyButton>Змінити час</MyButton>
                        <MyInput>
                            Радіус
                        </MyInput>
                        <MyButton>Змінити радіус</MyButton>
                        <MyButton onClick={setSettingsLocation}>Змінити геолокацію центра</MyButton>
                    </div>
                </div>
            </MyModal>
        </div>
    );
};

export default Room;