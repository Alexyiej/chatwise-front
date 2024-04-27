import { useRef, useState} from 'react';
import { apiClient, useWebSocket} from 'api';
import { toast } from 'react-toastify';
import { InviteCodeContainer } from '../../chat';



export default function ChatCreationModal(props){
	const { handleClick } = props;
	const chatNameRef = useRef(null);
	const invCodeRef = useRef(null);
	const [creationTypeChoice, setCreationTypeChoice] = useState('');
	const { reloadChats } = useWebSocket();
	
	function handleKeydown(event, ref){
		if (ref === null && event.key === 'Enter') return createChat();
		if (ref === null) return;
		if(event.key !== 'Enter') return;
		
		ref.current.focus();
	}


	function createChat(){
		const chatName = chatNameRef.current.value;

		if (!chatName) return;
		if (chatName.trim() === "") return;
		if (chatName.length > 10) return toast.warning('Chat name too long!');
		handleRequest({chat_name: chatName});
	}


	function joinChat(){
		const invitationCode = invCodeRef.current;

		if (invitationCode.length !== 6) return toast.warning('Please enter a valid code');
		if (!invitationCode) return;
		if (invitationCode.trim() === "") return;
		
		handleJoinRequest({invitation_code: invitationCode});
	}


	async function handleJoinRequest(payload){
		try {
			const response = await apiClient.post('/chat/join', payload);
	
			handleResponse(response);
			handleClick('', setCreationTypeChoice);
			toast.success('Chat joined');

		} catch(e) {
			const status = e.response.status;

			if (status === 404) return toast.error('Bad invitation code');
			if (status === 410) return toast.error('Invitation code expired'); 
		}
	}


	async function handleRequest(payload){
		handleClick('', setCreationTypeChoice);

		try {
			const response = await apiClient.post('/chat/create', payload);
	
			handleResponse(response);
			toast.success('Chat created');

		} catch(e){
			const status = e.response.status;

			if (status !== 201) return toast.error('An error occurred');
		}
	}


	function handleResponse(response) {
		const { chat_id, chat_name, messages, users_count, public_key } = response.data;
		
		reloadChats({ 
			chat_id, 
			chat_name, 
			messages,
			users_count,
			public_key
		});
	}


	function handleJoin(){
		setCreationTypeChoice('join');
	}


	function handleCreate(){
		setCreationTypeChoice('new');
	}
	

	const joinStruct = {
		handleKeyDown: handleKeydown,
		handleClick: joinChat,
		reference: invCodeRef,
		placeholder: 'Invitation code...',
		eventName: 'Enter the invitation code',
		buttonText: 'Join'
	};


	const createStruct = {
		handleKeyDown: handleKeydown,
		handleClick: createChat,
		reference: chatNameRef,
		placeholder: 'Chat name...',
		eventName: 'Create chat',
		buttonText: 'Create'
	};


	return (
		<div className="chat-create-modal">
			<div>
				<button className="back-btn" onClick={()=>handleClick(creationTypeChoice, setCreationTypeChoice)}>
					<i className="fa-solid fa-chevron-left"></i>
				</button>
			</div>

			<form>
				{
				creationTypeChoice === '' ? 
				<div>
					<button type='button' className="btn-app-primary" onClick={handleJoin}>Join</button>
					<button type='button' className="btn-app-primary" onClick={handleCreate}>Create</button>
				</div> 
				
				: creationTypeChoice === 'new' ? <ModalView data={createStruct}/>
				: creationTypeChoice === 'join' ? <ModalView data={joinStruct}/>
				: null
				}

			</form>
		</div>
	)
}


function ModalView(props){
	const { data } = props;
	const {reference, handleKeyDown, handleClick, placeholder, eventName, buttonText} = data;
    const codeLength = 6;
    const [currentCode, setCurrentCode] = useState(new Array(codeLength).fill(''));
	const inviteCode = currentCode.join('');

	if (buttonText === 'Join') {
		reference.current = inviteCode;
	} 

	return (
		<>
		<h1>{eventName}</h1>
		<div>
			{
			eventName === 'Create chat' ? <input className='input-class'  ref={reference} onKeyDown={(event)=>handleKeyDown(event, null)} type="text" placeholder={placeholder} /> 
			: 
			<InviteCodeContainer currentCode={currentCode} setCurrentCode={setCurrentCode} codeLength={codeLength}/>
			}
		</div>
		<button type='button' className="btn-app-primary" onClick={handleClick}>{buttonText}</button>	
		</>
	)
}