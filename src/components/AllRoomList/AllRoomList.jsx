import React, { useEffect, useState } from 'react';
import classes from './AllRoomList.module.css'

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { Link } from 'react-router-dom';

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

const AllRoomList = () => {
    const [roomList, setRoomList] = useState([]);

    useEffect(()=>{
        getAllRoomList();
    },[])

    const getAllRoomList = () =>{
        const db = firebase.firestore();
        const unsubscribe = db.collection('rooms').onSnapshot((snapshot) => {
            const rooms = [];
            snapshot.forEach((doc) => {
              rooms.push(doc.id);
            });
            setRoomList(rooms);
          });
      
          return () => {
            unsubscribe();
          };
    }
    
    return (
        <>
            {roomList.map((r)=>(
                <div key={r} className={classes.rooms_container}>
                    <div className={classes.dot}></div>
                    <Link to={`/room/${r}`} className={classes.room}>{r}</Link>
                </div>
            ))}
        </>
    );
};

export default AllRoomList;