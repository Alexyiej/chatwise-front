import { useNavigate } from "react-router-dom";



function NotFoundPage(){
	const navigate = useNavigate();

	function handleRedirect(){ navigate('/'); }

	return(
		<section className='not-found-pg'>
			<h1>Not Found 404</h1>
			<button className='prim-button' onClick={handleRedirect}>Home</button>
		</section>
	)
}

export default NotFoundPage