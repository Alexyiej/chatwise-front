import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { WebSocketProvider, apiClient } from 'api';
import { SideBar, ChatCreationModal, ScreenTint } from '../';
import { ChatView } from '../../chat';



export default function MainView({handleLogout}) {
	const location = useLocation();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [attemps, setAttemps] = useState(0);
	const [isError, setIsError] = useState();

	const navigate = useNavigate();

	function handleModal(currentState, setCreationType) {
		if (currentState === '' && isModalOpen) {setIsModalOpen(!isModalOpen); return};
		if (currentState === 'new' || currentState === 'join') setCreationType('');
		
		setIsModalOpen(true);
	}


	useEffect(() => {
		checkAuth();
	}, [])

	
	async function checkAuth(){
		try{
			const response = apiClient.get("/auth/jwt");

		} catch(e) {
			const status = e.response.status;
			if (status !== 401) return setIsError(true);
			if (attemps >= 3) return navigate('/auth/login');

			await checkAuth();
			setAttemps(attemps + 1);
		}
	}


	return (
		<>
		{
		isError ? <ErrorPage />
		: <WebSocketProvider>
			<div className="main-pg">
				<MainViewHeader handleClick={handleLogout}/>
				<div>
					{isModalOpen && <>
						<ChatCreationModal handleClick={handleModal}/>
						<ScreenTint />
					</> }
					<SideBar handleClick={() => handleModal('')}/>
					<main>
						<Routes> 
							<Route path="/" element={<ChatNotFound />} />
							<Route path="/chat/:chatId" element={<ChatView />} key={location.pathname} />
							<Route path="*" element={Navigate('/')} />
	
						</Routes>
					</main>
				</div>
				
			</div>
		</WebSocketProvider>
		}

		</>
		

    
	);
}



function MainViewHeader({handleClick}){
    return (
        <header className="main-view-header">
            <div>
				<button className="btn-app-primary" onClick={handleClick}>Sign out</button>
			</div>
        </header>
    );
}



function ChatNotFound(){
	return (
		<div className='chat-not-found'>
			<h1>Chat not found</h1>
		</div>
	)
}

function ErrorPage(){
	return (
		<div className='erorr-pg'>
			<h1>Something went wrong, please try again later.</h1>
		</div>
	)	
}