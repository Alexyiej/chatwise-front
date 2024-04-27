import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { apiClient, apiUrl }  from '../service';
import { se } from 'date-fns/locale';
import { Navigate, useNavigate } from 'react-router-dom';
import { set } from 'date-fns';
import { toast } from 'react-toastify';


export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, value, setValue }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [wasFetched, setWasFetched] = useState(false);
    const [chats, setChats] = useState([]);
    const [chatIds, setChatIds] = useState([]);
    const [socket, setSocket] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [callAnswer, setCallAnswer] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [chatsCount, setChatsCount] = useState(0);
    
    const navigate = useNavigate();
    const chatsRef = useRef(chats);
    chatsRef.current = chats;

    useEffect(()=>{
        setChatIds(chats.map((chat) => chat.chat_id));
    },[chatsCount])



    function reloadChats(newChat) {
        console.log(newChat)
		setChats([...chats, newChat]);
        setChatsCount(chatsCount + 1)
	}

    function chatRemove(chatId) {
        const newChats = chats.filter((chat) => chat.chat_id !== chatId);
        setChats(newChats);
        setChatsCount(chatsCount - 1)
        toast.success('Chat removed')
        navigate('/')
    }
    
	async function fetchChats() {
        try {
            const response = await apiClient.get('/chatlist');
            const data = response.data;
            setWasFetched(true);
            setChats(data);
            setChatIds(data.map((chat) => chat.chat_id));

        } catch (e) {
            //if (e.response.status !== 401) return;
            
            try {
                await apiClient.get('/auth/jwt', {
                    headers: { 'X-Retry-Attempt': 'true' }
                })
                setIsAuthorized(true);
            
            } catch (e) {
                //if (e.response.status !== 401) return; 
                navigate('/auth/login');
                setIsAuthorized(false)
            }
        }
	}


    function addMessage(message, send) {
        const { chat_id } = message;

        const chat = chatsRef.current.find((chat) => chat.chat_id === chat_id);
        chat.messages.push(message);
        
        setChats([...chatsRef.current]);
        if (send) socket.send(JSON.stringify(message));
    }

    
    function sendCallOffer(offer){
        socket.send(JSON.stringify(offer))
    } 
    

    function sendCallAnswer(answer){
        socket.send(JSON.stringify(answer))
    }


    function handleMessage(data){
        addMessage(data, false)
    }
    

    function handleIncomingCall(data){
        switch (data.type){
            case 'offer': {
                setIncomingCall(data)
                break;
            }
            case 'answer': {
                setCallAnswer(data)
                break;
            }
            default: console.warn('Unknown call type:', data.type)
        }
    }


    function connectToWebSocket(){
        const ws = new WebSocket(`ws://${apiUrl}/session`);

        ws.onerror = async function(event) {
            if (attempts >= 3) return navigate('/auth/login');

            try {
                await apiClient.get('/auth/jwt', {
                    headers: { 'X-Retry-Attempt': 'true' }
                })

                connectToWebSocket();
            } catch (e) {
                if (e.response.status !== 401) return;
                navigate('/auth/login');
            }
            
            setAttempts(attempts + 1);
        };

        ws.onopen = () => {
            setSocket(ws);
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const { msg_type, data } = message;

            switch (msg_type) {
                case 'call_offer': {
                    handleIncomingCall(data)
                    break;
                }
                case 'message': {
                    handleMessage(data)
                    break;
                }

                case 'chats_rcv': {
                    if (data === 200) setIsConnected(true);
                    break;
                }
                
                default: console.warn('Unknown message type:', msg_type);
            }
        };

        ws.onclose = () => {
            console.log("Disconnected");

            ws.close();
            setIsConnected(false);
            setSocket(null);
        };


        setSocket(ws);
    }

    
    useEffect(() => {
        if (!socket) return;
        if (!isConnected) return;
        console.log(chatIds)
        const message = JSON.stringify({ chat_ids: chatIds })
        socket.send(message)

    }, [chatIds, isConnected]);


    useEffect(() => {
        if (!wasFetched) fetchChats();
        connectToWebSocket();
       
        if (socket) return () => { socket.close(); };
    }, []);


    return (
        <WebSocketContext.Provider value={{ socket, isConnected, chats, incomingCall, callAnswer, isAuthorized, reloadChats, addMessage, sendCallOffer, sendCallAnswer, chatRemove}}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);