import { decryptMessage } from 'security';
import { base64ToArrayBuffer, getCorrectDate, timeAgo } from 'utils';
import { readKey } from 'security';
import { useState } from 'react';



export default function Message(props){
	const { message } = props;
	const { text, timestamp, iv, chat_id, is_mine } = message;
	const isMine = is_mine
	const wasSeen = true;
	const showHour = true;
	const date = "20:10";
	const timeAgoStr = "1 hour ago";
	const [msgText, setMsgText] = useState("");



	async function decrypt(){
		const encrypted = base64ToArrayBuffer(text)
		const randNumbers = base64ToArrayBuffer(iv)

		const decrypted = await decryptMessage(encrypted, randNumbers, chat_id)

		setMsgText(decrypted)
	}



	const wrapperClass = `message-wrapper ${isMine ? 'wrapper-right' : 'wrapper-left'}`;
	const infoClass = `message-info ${isMine ? 'info-right' : 'info-left'}`
	const msgClass = `message ${isMine ? 'border-radius-right' : 'border-radius-left'}`;



	decrypt()
	if (!msgText) {return null}

	

	return(
		<>
		<div className={wrapperClass}>
			<div className={infoClass}>
				{
				isMine ? 
				<> <h4></h4> <span>{showHour ? date : ''}</span> </> : 
				<> <h4>Nazwa</h4> <span>{showHour ? date : ''}</span> </>
				}
			</div>
			<div className={msgClass} >
				<div>
					<p>{msgText}</p>
				</div>
				<footer>
					<span>{timeAgoStr}</span>
					{wasSeen ? <i className="fa-solid fa-eye"></i> : null }
				</footer>
			</div>
		</div>
		</>
	)
}