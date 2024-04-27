import { formatDistanceToNow } from 'date-fns';



function convertToDate(timestamp) {
	return new Date(timestamp);
}



function getCorrectDate(date) {
	const now = new Date();
  
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
	if (compareDate.getTime() === today.getTime()) return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
	
	else {
	  	const oneDay = 24 * 60 * 60 * 1000; 
	  	const diffInDays = (today - compareDate) / oneDay;
  
		if (diffInDays < 7 && today.getDay() >= compareDate.getDay()) return `${date.toLocaleDateString('default', { weekday: 'long' })}`;
	  
		else return date.toLocaleDateString();
	  
	}
}



function timeAgo(date) {
	return formatDistanceToNow(date, { addSuffix: true });
}



export { convertToDate, getCorrectDate, timeAgo };