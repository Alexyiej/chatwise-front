import { useRef, useState } from 'react';
import { apiClient } from 'api';
import '../styles.scss';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';



function Login(){
	const [showPassword, setShowPassword] = useState(false);
	const loginRef = useRef();
	const passwordRef = useRef();
	const navigate = useNavigate();

	async function handleLogin(){
		const username = loginRef.current.value;
		const password = passwordRef.current.value;
		
		try {
			let response = await apiClient.post('/auth/login', {
				username,
				password,
			});
			
			localStorage.setItem('username', username.toLowerCase());

			navigate('/');

		} catch (e) {
			console.log(e)
			if (e.response.status === 401) return toast.error('Invalid username or password');
			toast.error('An error occurred');
		}
		
		
	}


	return (
		<section>
			
			<div className='right'>
				<h1>Login</h1>
				<form>
					<label>
						<span>Username / Email</span>
						<div>
							<input ref={loginRef} type="text" placeholder="Enter username or email..." />
							<div>
							</div>
						</div>
					</label>

					<label>
						<span>Password</span>
						<div>
							<input ref={passwordRef} type = {showPassword ? 'text' : 'password'} placeholder="Enter password..." />
							<div onClick={()=>{
								setShowPassword(!showPassword)
							}}>
								<i className="fa-solid fa-eye"></i>
							</div>
						</div>
					</label>

					<button type="button" className='prim-button' onClick={handleLogin}>Login</button>
				</form>
				<p>
					Don't have an account? <a href="/auth/register">Register</a>
				</p>
			</div>
			<div className="left">
			</div>
		</section>
	)
}

export default Login