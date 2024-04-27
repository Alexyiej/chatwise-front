import './App.scss'
import 'react-toastify/dist/ReactToastify.css';
import React, { useState } from 'react';
import { useEffect } from 'react'
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { MainView, NotFound} from './components/app';
import { Login, Register } from './components/auth';
import { ToastContainer } from 'react-toastify';
import { apiClient } from 'api';


function App() {
	const location = useLocation();
	const navigate = useNavigate();

	async function handleLogout() {
		localStorage.removeItem('token');
		localStorage.removeItem('username');

		await apiClient.post('/auth/logout');
		navigate('/auth/login');
	}

	return (
		<>
		<ToastContainer />
		<Routes>
			<Route path="/auth/login" element={<Login />} />
			<Route path="/auth/register" element={<Register />} />
			<Route path="/*" element={<MainView handleLogout={handleLogout}/>}/>
		</Routes>
		</>

	);
}


export default App;