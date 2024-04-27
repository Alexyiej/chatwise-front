import { useRef, useState } from 'react';
import { apiClient } from 'api';
import '../styles.scss';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { generateDHKeys, saveKey } from 'security';
import { arrayBufferToBase64 } from '../../../utils';
import { useNavigate } from 'react-router-dom';



function Register(){
	const [showPassword, setShowPassword] = useState(false);
	const usernameRef = useRef();
	const passwordRef = useRef();
	const passwordConfirmRef = useRef();
	const emailRef = useRef();
	const navigate = useNavigate();


	async function handleEnter(event, inputRef) {
		if (event.key !== "Enter") return;
		if (inputRef === null) { await handleRegister(); return };

		inputRef.current.focus();
	}


	async function handleRegister(){
		const username = usernameRef.current.value;
		const password = passwordRef.current.value;
		const passwordConfirm = passwordConfirmRef.current.value;
		
		if (password !== passwordConfirm){ toast.warning('Passwords do not match'); return; }
		
		const keys = await generateDHKeys();
		const publicKeyBase64 = arrayBufferToBase64(keys.publicKey);

		localStorage.setItem('username', username.toLowerCase());
		const uName = localStorage.getItem('username');
		saveKey(`private_key:${uName}`, keys.privateKey);
		
		try {
			let response = await apiClient.post('/auth/register', {
				username,
				password,
				public_key: publicKeyBase64, 
			});
			
			if (response.status !== 201) return toast.error('An error occurred');

			toast.success('Account created!'); 
			navigate('/')
			return;
	
		} catch (e) {
			const status = e.response.status;

			if (status === 409){
				toast.error('Username or email already exists');
				usernameRef.current.focus();
				return;
			} 
		}

		return toast.error('An error occurred');
	}

	return (
		<section>
			<div className="left">
			</div>
			<div className='right'>
				<h1>Create account</h1>
				<form>
					<label>
						<span>Username</span>
						<div>
							<input
							onKeyDown={(event) => {handleEnter(event, emailRef)}}
							ref={usernameRef} type="text" placeholder="Enter username..." />
							<div>
							</div>
						</div>
					</label>
					<label>
						<span>Email</span>
						<div>
							<input 
							onKeyDown={(event) => {handleEnter(event, passwordRef)}}
							ref={emailRef} type="text" placeholder="Enter email..." />
							<div>
							</div>
						</div>
					</label>
					<label>
						<span>Password</span>
						<div>
							<input 
							onKeyDown={(event) => {handleEnter(event, passwordConfirmRef)}}
							ref={passwordRef} type = {showPassword ? 'text' : 'password'} placeholder="Repeat password..." />
							<div onClick={()=>setShowPassword(!showPassword)}>
								<i className="fa-solid fa-eye"></i>
							</div>
						</div>
					</label>
					<label>
						<span>Repeat password</span>
						<div>
							<input 
							onKeyDown={async (event) => {await handleEnter(event, null)}}
							ref={passwordConfirmRef} type = {showPassword ? 'text' : 'password'} placeholder="Repeat password..." />
							<div onClick={()=>setShowPassword(!showPassword)}>
								<i className="fa-solid fa-eye"></i>
							</div>
						</div>
					</label>

					<button type="button" className='prim-button' onClick={handleRegister}>Submit</button>
				</form>
				<p>
					Already have an account? <a href="/auth/login">Login</a>
				</p>
			</div>
				
		</section>
	)
}

export default Register