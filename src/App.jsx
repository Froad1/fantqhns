import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom'
import MapWithMarkers from './components/MapWithMarkers/MapWithMarkers';
import SeekingMap from './components/SeekingMap/SeekingMap';
import Home from './pages/Home/Home';
import Room from './pages/Room/Room';

function App() {
  
  return (
    <div className='App'>
      <Router basename={import.meta.env.DEV ? '/fantqhns' : '/fantqhns'}>
        <Routes>
          <Route index element={<Home/>}/>
          <Route path='/room/:roomId' element={<Room/>}/>
          <Route path='/map/seeking/:roomId' element={<SeekingMap/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
