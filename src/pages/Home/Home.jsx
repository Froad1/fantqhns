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
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      firebase.auth().onAuthStateChanged((user) => {
          if (user) {
              setUser(user);
          }
      })
  }, [])

    const navigateToRoom = () => {
      if(user){
        navigate(`/room/${inputId}`)
      }
      else{
        navigate('/login')
      }
    }

    const connectToRoom = () =>{
      if(user){
        setModal(!modal)
      }
      else{
        navigate('/login')
      }
    }

    return (
        <div className={classes.home_page_container}>
            <div className={classes.buttons_container}>
              <MyButton style={{background: '#C7B8EA'}}>Створити кімнату</MyButton>
              <MyButton style={{background: '#E9E9E9'}} onClick={connectToRoom}>Підʼєднатися до кімнати</MyButton>
            </div>
            <MyModal visible={modal} setVisible={setModal}>
                <MyInput children={'ID Кімнати'} value={inputId} onChange={(e)=>{setInputId(e.target.value)}}/>
                <MyButton onClick={navigateToRoom} style={{background: '#C7B8EA', marginBottom: '2rem', marginTop: '1rem'}}>Підʼєднатися</MyButton>
                <AllRoomList/>
            </MyModal>
        </div>
    );
};

export default Home;