import React, { useEffect, useState } from 'react';
import classes from './Home.module.css'
import MyButton from '../../components/UI/MyButton/MyButton';
import MyModal from '../../components/UI/MyModal/MyModal';
import AllRoomList from '../../components/AllRoomList/AllRoomList';
import MyInput from '../../components/UI/MyInput/MyInput';
import { useNavigate } from 'react-router';

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



const Home = () => {
    const [modal, setModal] = useState(false);
    const [inputId, setInputId] = useState('')
    const [user, setUser] = useState([]);
    const navigate = useNavigate();

    const navigateToRoom = () => {
        navigate(`/room/${inputId}`)
    }

    useEffect(()=>{
        console.log(user);
    },[user])

    const signInGoogle = () =>{
        const authProvider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(authProvider)
          .then((userCredential) => {
            const us = userCredential.user;
            setUser(us);
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage)
          });
      }

    const signInAnonimus = () =>{
        firebase.auth().signInAnonymously()
        .then((userCredential) => {
          const us = userCredential.user;
          setUser(us);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    return (
        <div className={classes.home_page_container}>
            <MyButton style={{background: '#C7B8EA'}}>Створити кімнату</MyButton>
            <MyButton onClick={()=>setModal(!modal)}>Підʼєднатися до кімнати</MyButton>
            <MyModal visible={modal} setVisible={setModal}>
                <MyInput children={'ID Кімнати'} value={inputId} onChange={(e)=>{setInputId(e.target.value)}}/>
                <MyButton onClick={navigateToRoom} style={{background: '#C7B8EA'}}>Підʼєднатися</MyButton>
                <AllRoomList/>
            </MyModal>
            <button onClick={signInGoogle}>Google</button>
            <button onClick={signInAnonimus}>Anon</button>
        </div>
    );
};

export default Home;