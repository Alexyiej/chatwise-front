import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useWebSocket, apiClient } from 'api';
import { encryptMessage } from 'security';
import { ChatHeader, InviteCodeContainer, Message } from '../';
import { decryptMessage, getPublicKey, readKey, saveKey, deriveSecretKey} from 'security';
import { arrayBufferToBase64, base64ToArrayBuffer} from 'utils';



export default function ChatView(){
	const { chatId } = useParams();
	const inputref = useRef(null);
	const msgContainerRef = useRef(null);
	const [currChat, setCurrentChat] = useState(null);
	const [invitationCode, setInvitationCode] = useState('');
	const [isNoParticipants, setIsNoParticipants] = useState(true);
	const [isKeySet, setIsKeySet] = useState(false);
	const { socket, chats, reloadChats, addMessage} = useWebSocket();
    const [messagesCount, setMessagesCount] = useState(0);
	const messagesRef = useRef(null);
	const navigate = useNavigate();
	const controller = new AbortController();


	useEffect(()=>{
		scrollToBottom();
	},[messagesCount])


	useEffect(() => {
		setCurrentChat(chats.find((chat) => chat.chat_id === chatId));
		scrollToBottom();		
	}, [chatId]);	

	
	useEffect(()=>{
		scrollToBottom();
	},[])


	useEffect(() => {
		if (!currChat) return;
		
		const { messages, users_count, public_key, chat_id } = currChat;

		setIsNoParticipants(users_count === 0);
		handlePublicKey(public_key);
		messagesRef.current = messages;

		if (users_count === 0) fetchInvitationCode(chatId);
		
		return () => { controller.abort() };
	}, [currChat]);


	useEffect(() => {
		const chat = chats.find((chat) => chat.chat_id === chatId);
		if (!chat) navigate("/")
		setCurrentChat(chat);

		if (!msgContainerRef.current) return;
		setMessagesCount(chat.messages.length);
	}, [chats]);


	function scrollToBottom() {
		if (!msgContainerRef.current) return;
		setTimeout(() => {
			msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
		}, 100); 
	}
    

	async function handlePublicKey(publicKey){
		if (!publicKey) return;

		const keyBuffer = base64ToArrayBuffer(publicKey);
		const secretKey = await deriveSecretKey(keyBuffer);

		await saveKey(`secret_key_${chatId}`, secretKey)
		setIsKeySet(true);
	}


	async function fetchInvitationCode(chatId){
		try {
			const response = await apiClient.post('/chat/invitation/create', {
				signal: controller.signal,
				chat_id: chatId
			});

			const data = response.data;
			if (data) setInvitationCode(data);

		} catch (e) {}
	}


	function handleInput(event){
		const { value } = event.target;

		if(event.key !== 'Enter') return;
		if(event.key === 'Enter' && event.shiftKey) return;
		
		createMessage(value);
		inputref.current.value = '';
	}

	
	async function createMessage(text){ 
		if (!text || text.trim() === "") return;	
		if (!isKeySet) return;

		const {iv, encrypted } = await encryptMessage(text, chatId)
		
		const message = {
			chat_id: chatId,
			timestamp: "12312312",
			text: arrayBufferToBase64(encrypted),
			iv: arrayBufferToBase64(iv),
			is_mine: true,
		}
		
		await addMessage(message, true)
	} 


	if (!currChat || !isKeySet && !isNoParticipants) return( null );
	
	const { messages } = currChat;
	return(
		<>
		<ChatHeader currChat={currChat}/>
		{
		isNoParticipants ? <NoParticipantsMsg inviteCode={invitationCode}/> :
		<>
		<section ref={msgContainerRef} className="message-container" key={chatId}>
			{messages.map((message, index) => <Message message={message} key={index}/>)}
		</section>
		<footer>
			<input 
				ref={inputref}
				placeholder="Aa..."
				className="input-class"
				onKeyDown={handleInput} 
			/>
			<i className="fa-solid fa-paper-plane"></i>
		</footer>
		</>
		}
		</>
	)
}


function NoParticipantsMsg({inviteCode}){
	return (
		<div className="empty-chat">
			<h1>Invite someone, let's talk!</h1>
			<p>{inviteCode}</p>
			<button className='btn-app-primary'>Copy invite code</button>
		</div>
	)
}