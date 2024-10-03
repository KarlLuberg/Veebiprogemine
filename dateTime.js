const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
const weekDayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];

const dateEt = function(){
	let timeNow = new Date();	
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();	
	let dateNowEt = dateNow + ". " + monthNamesEt[monthNow] + " " + yearNow;
	return dateNowEt;
}

const weekDayEt = function(){
	let timeNow = new Date();
	let dayNow = timeNow.getDay();
	return weekDayNamesEt [dayNow]
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	return hourNow + ":" + minuteNow + ":" + secondNow;
}

const partOfDay = function(){
	let timeNow = new Date();
	let dayPart;
	let day = timeNow.getDay();
	if(day >= 1 && day <= 5){
		if(timeNow.getHours() >= 8 && timeNow.getHours() < 16){
			dayPart = "kooliaeg";
		} else if(timeNow.getHours() >= 16 && timeNow.getHours() < 23){	
			dayPart = "vaba aeg / õppimine";
		} else {
			dayPart = "uneaeg";
		}
	}
	else {
		if(timeNow.getHours() >= 9 && timeNow.getHours() < 23){	
			dayPart = "chill";
		} else {
			dayPart = "uneaeg";
		}
	}
	return dayPart;
}
module.exports = {monthsEt: monthNamesEt, weekDaysEt: weekDayNamesEt, dateEt: dateEt, weekDayEt: weekDayEt, timeEt: timeFormattedET, partOfDay: partOfDay}