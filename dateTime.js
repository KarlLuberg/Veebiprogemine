
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





const givenDateFormatted = function(gDate){
	let specDate = new Date(gDate);
	return specDate.getDate() + ". " + monthNamesEt[specDate.getMonth()] + " " + specDate.getFullYear();	
}

const weekDayEt = function(){
	let timeNow = new Date();
	let dayNow = timeNow.getDay();
	return weekDayNamesEt [dayNow]
}

const timeFormattedET = function(gDate){
	let timeNow = new Date();
	let specDate = new Date(gDate);
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	return hourNow + ":" + minuteNow + ":" + secondNow;
}

const daysBetween = function(gDate){
	notice = "teadmata";
	let today = new Date();
	let anotherDay = new Date(gDate);
	let diff = today - anotherDay;
	let diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
	if(today == anotherDay){
		notice = "tÃ¤na";
	}
	else if(today < anotherDay){
		notice = Math.abs(diffDays) + " p2eva pÃ¤rast";
	}
	else {
		notice = diffDays + " p2eva tagasi";
	}
	return notice;
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
module.exports = {monthsEt: monthNamesEt, weekDaysEt: weekDayNamesEt, dateEt: dateEt, weekDayEt: weekDayEt, timeEt: timeFormattedET, partOfDay: partOfDay, givenDateFormatted: givenDateFormatted, daysBetween: daysBetween};