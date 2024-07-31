import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom'
import Home from './pages/Home/Home';
import Room from './pages/Room/Room';
import Seeking from './pages/Seeking/Seeking';
import Hiding from './pages/Hiding/Hiding';
import Login from './pages/Login/Login';

function App() {
  
  return (
    <div className='App'>
      <Router basename={import.meta.env.DEV ? '/fantqhns' : '/fantqhns/'}>
        <Routes>
          <Route index element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/room/:roomId' element={<Room/>}/>
          <Route path='/map/seeking/:roomId' element={<Seeking/>}/>
          <Route path='/map/hiding/:roomId' element={<Hiding/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
