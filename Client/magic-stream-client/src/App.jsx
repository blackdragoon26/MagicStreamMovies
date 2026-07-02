import { useState, useEffect } from 'react'
import './App.css'
import Home from './components/home/Home';
import Recommended from './components/recommended/Recommended';
import Review from './components/review/Review';
import Header from './components/header/Header';
import Register from './components/register/Register';
import Login from './components/login/Login';
import Layout from './components/Layout';
import RequiredAuth from './components/RequiredAuth';
import axiosClient from './api/axiosConfig';
import useAuth from './hooks/useAuth';
import StreamMovie from './components/stream/StreamMovie';
import AddMovie from './components/addmovie/AddMovie';

import {Route, Routes, useNavigate} from 'react-router-dom'

function App() {

  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  
  const updateMovieReview = (imdb_id) => {
      navigate(`/review/${imdb_id}`);
  };
   
  const handleLogout = async () => {

        try {
            const response = await axiosClient.post("/logout",{user_id: auth.user_id});
            console.log(response.data);
            setAuth(null);
           // localStorage.removeItem('user');
            console.log('User logged out');

        } catch (error) {
            console.error('Error logging out:', error);
        } 

    };

  return (
    <>
      <Header handleLogout = {handleLogout}/>
      <Routes path="/" element = {<Layout/>}>
        <Route path="/" element={<Home updateMovieReview={updateMovieReview}/>}></Route>
        <Route path="/register" element={<Register/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route element = {<RequiredAuth/>}>
            <Route path="/recommended" element={<Recommended/>}></Route>
            <Route path="/review/:imdb_id" element={<Review/>}></Route>
            <Route path="/stream/:imdb_id" element={<StreamMovie/>}></Route>
            <Route path="/add-movie" element={<AddMovie/>}></Route>
        </Route>
      </Routes>

      <footer 
        style={{
          background: '#030304',
          borderTop: '1px solid #121217',
          padding: '24px 0',
          textAlign: 'center',
          color: '#52525c',
          fontSize: '0.85rem',
          letterSpacing: '0.5px'
        }}
      >
        <div className="container">
          <span>Made by </span>
          <a 
            href="https://sankalpjha.dev/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: '#fff', textDecoration: 'none', borderBottom: '1px solid #e50914', paddingBottom: '2px', fontWeight: '600' }}
          >
            Sankalp Jha
          </a>
        </div>
      </footer>
    </>
  )
}

export default App
