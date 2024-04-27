import { useNavigate } from 'react-router-dom';
import { useWebSocket, apiClient } from 'api';
import { useEffect, useState } from 'react';
import { decryptMessage } from 'security';
import {base64ToArrayBuffer} from 'utils';


export default function SideBar(props){
	const { handleClick } = props;
	const { socket, isConnected, chats, reloadChats, chatRemove} = useWebSocket();
	
	useEffect(() => {	
	}, [chats])
	
	async function handleRemove(chat_id) {
		try {
			await apiClient.delete(`/chat/remove/${chat_id}`);
			chatRemove(chat_id)
		} catch(e) {
			console.log(e)
		}
	}


	return (
		<aside>
			<div>
				<h1>Your chats</h1>
				<div>
					<input type="text" className='input-class' placeholder="Search..." />
					<i className="fa-solid fa-magnifying-glass"></i>
				</div>
			</div>
			<div>
				<ul>
					<button className="btn-app-primary" onClick={handleClick} >New chat</button>
					{chats.map((chat, index) => <Chat  key={index} chat={chat} handleRemove={handleRemove} />)}
				</ul>
			</div>
      	</aside>
	)
}



function Chat(props) {
	const { chat, handleRemove } = props;
	const { chat_id, chat_name, messages } = chat;
	const [lastMsg, setLastMsg] = useState(null);
	const [msgText, setMsgText] = useState("");
	const navigate = useNavigate();
	
	useEffect(() => {
		if (messages.length === 0) return;
		setLastMsg(messages[messages.length - 1]);
	}, [chat.messages.length])
	

	useEffect(()=>{
		if (!lastMsg) return;
		decrypt(lastMsg)
	},[lastMsg])

	
	async function decrypt(msg){
		const {text, iv} = msg;
		const encrypted = base64ToArrayBuffer(text)
		const randNumbers = base64ToArrayBuffer(iv)

		const decrypted = await decryptMessage(encrypted, randNumbers, chat_id)

		setMsgText(decrypted)
	}

	
	function handleClick(event) {
		if (event.target.tagName === 'I') return;
		navigate(`/chat/${chat_id}`);
	}
	


	return (
		<li className="chat" onClick={handleClick}>
			<div>
				<h3>{chat_name}</h3>
				<i onClick={()=> handleRemove(chat_id)} className="fa-solid fa-x"></i>
			</div>
			<div>
				{
				lastMsg ? 
				<>
				<span><span> {lastMsg.is_mine ? 'You:' : ''}</span>{msgText}</span> 
				<span></span>
				</>
				: null
				}
			</div>
		</li>			
	)
}