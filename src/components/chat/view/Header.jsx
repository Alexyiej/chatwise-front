import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from "api";



export default function ChatHeader(props){
	const { currChat } = props;
	const { chat_name, users_count } = currChat;
	const [isModalOpen, setIsModalOpen] = useState(false);	

	const navigate = useNavigate();

	function handleClick(){
		navigate('/');
	}
	
	function handleModal(){
		setIsModalOpen(!isModalOpen);
	}

	return(
		<header className='chat-header'>
			{isModalOpen ? <CallModal /> : null}
			<div>
				<button className="back-btn" onClick={handleClick}>
					<i className="fa-solid fa-chevron-left"></i>
				</button>
				<h1>{chat_name}</h1>
			</div>
			
			{
			users_count === 0 ? null : 			
			<ul>
				<li><i className="fa-solid fa-magnifying-glass"></i></li>
				<li onClick={handleModal}><i className="fa-solid fa-phone"></i></li>
				<li><i className="fa-solid fa-ellipsis-vertical"></i></li>
			</ul>
			}

		</header>
	)
}


// Narazie nie bedzie dzialac bo potrzebuje certyfikat https
function CallModal() {
	const [localStream, setLocalStream] = useState(null);
	const remoteAudioRef = useRef();
	const peerConnectionRef = useRef(null);
	const { sendCallOffer, sendCallAnswer, incomingCall } = useWebSocket();
  
	useEffect(() => {
		async function startMediaStream() {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
				setLocalStream(stream);
			} catch (error) {
				console.error('Error accessing media devices:', error);
			}
		};
  
	  	startMediaStream();
  
		return () => {
			if (localStream) {
				localStream.getTracks().forEach(track => track.stop());
			}
	  };
	}, []);
  
	function createPeerConnection() {
		const peerConnection = new RTCPeerConnection();
	  	peerConnectionRef.current = peerConnection;
  
	  	peerConnection.addEventListener('track', event => {
			if (event.streams && event.streams[0]) {
				const remoteAudioStream = event.streams[0];
		  		remoteAudioRef.current.srcObject = remoteAudioStream;
			}
	  	});
	  
	  	peerConnection.addEventListener('iceconnectionstatechange', () => {
			console.log('Ice connection state:', peerConnection.iceConnectionState);
	  	});
  
	 	 if (localStream) {
			localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
	  	}
  
	  	return peerConnection;
	}
  

	async function handleCall() {
	  	const peerConnection = createPeerConnection();
  
	  	try {
			const offer = await peerConnection.createOffer();
			await peerConnection.setLocalDescription(offer);
  
			sendCallOffer(offer);
	  	} catch (error) {
			console.error('Error creating offer:', error);
	  	}
	}
  
	async function handleOffer() {
		const peerConnection = createPeerConnection();
		const offer = incomingCall;
  
		try {
			await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
			const answer = await peerConnection.createAnswer();
			await peerConnection.setLocalDescription(answer);
	
			sendCallAnswer(answer);
		} catch (error) {
			console.error('Error creating answer:', error);
		}
	}
  
	return (
	<div className="chat-create-modal">
		<h1>Calling NAME</h1>
		<div>
			<audio ref={remoteAudioRef} autoPlay={true} playsInline={true} style={{ display: 'none' }} />
		</div>
			<button onClick={handleCall}>Call</button>
			<button onClick={handleOffer}>
			{incomingCall ? 'Accept' : 'Decline'} Answer
		</button>
	</div>
	);
  }