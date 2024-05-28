import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { generateToken, messaging } from './notification/firebase';
import { onMessage } from "firebase/messaging";
import Toast from './swal_fire/swal_fire';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from './components/NavBar'; // Assuming NavBar is placed in components folder
import Home from './pages/blogger/Home';
import Login from './pages/blogger/Login';
import Profile from './pages/blogger/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import Register from './pages/blogger/Register';
import Notification from './pages/blogger/Notifications';
import ComponentPage from './pages/blogger/ComponentPage';
const Swal = require('sweetalert2');

function App() {
  useEffect(() => {
    generateToken();
    onMessage(messaging, (payload) => {
      Toast.fire({
        icon: 'info',
        title: payload.notification.title,
      });
      console.log('Message received:', payload);
    });
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />  
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/register" element={<Register />} />
          <Route path='/notifications' element={<Notification/>}/>
          <Route path="/comments/:blogId" element={<ComponentPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
