const express = require("express");
const dtEt = require ("./dateTime");
const fs = require("fs");
const dbInfo = require("../../vp2024config");
const mysql = require("mysql2");
//p2ringu
const bodyparser = require("body-parser");
//failide yleslaadimiseks
const multer = require("multer");
//pildimanipulatsiooniks suuruse muutmine
const sharp = require("sharp");
const bcrypt = require("bcrypt");
const session = require("express-session");
const async = require("async");

const app = express();
app.use(session({secret: "Salav2rk", saveUninitialized: true, resave: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
//p2ringu url i parsimine, false kui ainult tekst, true kui muud ka
app.use(bodyparser.urlencoded({extended: true}));
//seadistame vahevara multer fotode laadimiseks kindlasse kausta
const upload = multer({dest: "./public/gallery/orig/"});

const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase,
});


const checkLogin = function(req, res, next){
	if(req.session != null){
		if(req.session.userId){
			console.log("Login, sees kasutaja: " + req.session.userId);
			next();
		}
		else {
			console.log("login not detected");
			res.redirect("/signin");
		}
	}
	else {
		console.log("session not detected");
		res.redirect("/signin");
	}
}

app.get("/", (req, res)=>{
	//res.send("Express l2ks t2iesti k2ima!");
	res.render("index",{days: dtEt.daysBetween("9-2-2024")});
});

app.get("/signin", (req, res)=>{
	res.render("signin");
});

app.post("/signin", (req, res)=>{
	let notice = "";
	if(!req.body.emailInput || !req.body.passwordInput){
		console.log("Andmeid puudu");
		notice = "Sisselogimise andmeid on puudu!";
		res.render("signin",{notice: notice});
	}
	else {
		let sqlReq = "SELECT id, password FROM vp1users WHERE email = ?";
		conn.execute(sqlReq, [req.body.emailInput], (err, result)=>{
			if(err){
				console.log("Viga andmebaasist lugemisel!" + err);
				notice = "Tehniline viga, sisselogimine ebaõnnestus!";
				res.render("signin",{notice: notice});
			}
			else {
				if(result[0] != null){
					//kasutaja on olemas, kontrollime sisestatud parooli
					bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{
						if(err){
							notice = "Tehniline viga, sisselogimine ebaõnnestus!";
							res.render("signin",{notice: notice});
						}
						else {
							//kas õige või vale parool
							if(compareresult){
								//notice = "Oled sisse loginud!";
								//res.render("signin",{notice: notice});
								req.session.userId = result[0].id;
								res.redirect("/home");
							}
							else {
								notice = "Kasutajatunnus ja/või parool on vale!";
								res.render("signin",{notice: notice});
							}
						}
					});
				}
				else {
					notice = "Kasutajatunnus ja/või parool on vale!";
					res.render("signin",{notice: notice});
				}
			}
		});//conn.execute lõppeb
	}
	//res.render("index",{days: dtEt.daysBetween("9-2-2024")});
});

app.get("/home", checkLogin, (req, res)=>{
	console.log("sees on kasutaja: ")
	res.render("home");
});

app.get("/logout", (req, res)=>{
	req.session.destroy();
	console.log("v2lja logitud");
	res.redirect("/");
});

app.get("/signup", (req, res)=>{
	res.render("signup");
});

app.post("/signup", (req, res) => {
    let notice = "Ootan andmeid!";
    console.log(req.body);
    
    // kasutaja andmete kontroll
    if (!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput || !req.body.genderInput || !req.body.emailInput || req.body.passwordInput.length < 8 || req.body.passwordInput !== req.body.confirmPasswordInput) {
        console.log("Andmeid on puudu või paroolid ei kattu!");
        notice = "Andmeid on puudu, parool liiga lühike või paroolid ei kattu!";
        res.render("signup", { notice: notice });
    } else {
        // emaili olemasolu kontroll
        let sqlCheckEmail = "SELECT id FROM vp1users WHERE email = ?";
        conn.execute(sqlCheckEmail, [req.body.emailInput], (err, result) => {
            if (err) {
                console.log("Viga andmebaasist lugemisel!" + err);
                notice = "Tehniline viga, kasutajat ei loodud.";
                res.render("signup", { notice: notice });
            } else if (result.length > 0) {
                // juhul kui email on olemas
                notice = "Kasutaja, kelle e-posti aadress on " + req.body.emailInput + ", on juba registreeritud, palun proovi uut e-posti.";
                res.render("signup", { notice: notice });
				console.log(result.length);
            } else {
                // juhul kui emaili pole varem kasutatud ja saab kasutaja luua
                notice = "Andmed sisestatud!";
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) {
                        notice = "Tehniline viga, kasutajat ei loodud";
                        res.render("signup", { notice: notice });
                    } else {
                        bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash) => {
                            if (err) {
                                notice = "Tehniline viga parooli krüpteerimisel, kasutajat ei loodud";
                                res.render("signup", { notice: notice });
                            } else {
                                let sqlReq = "INSERT INTO vp1users (first_name, last_name, birth_date, gender, email, password) VALUES(?,?,?,?,?,?)";
                                conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput, req.body.genderInput, req.body.emailInput, pwdHash], (err, result) => {
                                    if (err) {
                                        notice = "Tehniline viga andmebaasi kirjutamisel, kasutajat ei loodud.";
                                        res.render("signup", { notice: notice });
                                    } else {
                                        notice = "Kasutaja " + req.body.emailInput + " edukalt loodud!";
                                        res.render("signup", { notice: notice });
                                    }
                                }); // conn.execute lõpp
                            }
                        }); // hash lõppeb
                    }
                }); // genSalt lõppeb
            }
        }); // conn.execute lõpp
    }
});

app.get("/timenow", (req, res)=>{
    const weekdayNow = dtEt.weekDayEt();
    const dateNow = dtEt.dateEt();
    const timeNow = dtEt.timeEt();
    res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowT: timeNow});
});

app.get("/vanasonad", (req, res)=>{
    let folkWisdom = [];
    fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data)=>{
        if(err){
            //throw err;
            res.render("justlist", {h2: "Vanasõnad", listData: ["Ei leidnud ühtegi vanasõna"]});
        }
        else {
            folkWisdom = data.split(";");
            res.render("justlist", {h2: "Vanasõnad", listData: folkWisdom});
        }
    });

});

app.get("/regvisit", (req, res)=>{
    res.render("regvisit");
});

app.get("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	console.log(req.body);
	fs.open("public/textfiles/visitlog.txt", "a", (err, file)=>{
		if(err){
			throw err;
		}
		else {
			fs.appendFile("public/textfiles/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ";", (err)=>{
				if(err){
					throw err;
				}
				else {
					console.log("Faili kirjutati!");
					res.render("regvisit");
				}
			});
		}
	});
});

app.get("/regvisitdb", (req, res)=>{
	let notice = "";
    res.render("regvisitdb");
});

app.post("/regvisitdb", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	if(!req.body.firstNameInput || !req.body.lastNameInput){
		firstName = req.body.firstNameInpu;
		lastName = req.body.lastNameInput;
		notice = "Osa andmeid sisestamata";
		res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
	}
	else {	
		let sqlreq = "INSERT INTO vp1visitlog (first_name, last_name) VALUES(?,?)";
		conn.query(sqlreq, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlres)=>{
			if(err){
				throw err;
			}
			else {
				notice = "külastus registreeritud";
				res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
			}
		});
	}
});

app.get("/eestifilm", (req, res)=>{
	res.render("filmindex");
});

app.get("/eestifilm/tegelased", (req, res)=>{
	let sqlReq = "SELECT first_name, last_name, birth_date FROM person";
	let persons = [];
	conn.query(sqlReq, (err, sqlres)=>{
		if(err){
			throw err;
		}
		else {
			console.log(sqlres);
			//persons = sqlres;
			//for i algab 0 piiriks sqlres.length
			//tsykli sees lisame persons listile uue elemendi, mis on ise "objekt" {first_name: sqlres[i].first_name}
			//listi lisamiseks on k2sk
			//push.persons(lisatav element);
			for (let i = 0; i < sqlres.length; i ++){
				persons.push({first_name: sqlres[i].first_name, last_name: sqlres[i].last_name, birth_date: dtEt.givenDateFormatted(sqlres[i].birth_date)});
			}
			res.render("tegelased", {persons: persons});
		}
	});
	//res.render("tegelased");
});

app.get("/eestifilm/lisaSeos", (req, res) => {
    const filmQueries = [
        function(callback) {
            let sqlReq1 = "SELECT id, first_name, last_name, birth_date FROM person";
            conn.execute(sqlReq1, (err, result) => {
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, result);
                }
            });
        },
        function(callback) {
            let sqlReq2 = "SELECT id, title, production_year FROM movie";
            conn.execute(sqlReq2, (err, result) => {
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, result);
                }
            });
        },
        function(callback) {
            let sqlReq3 = "SELECT id, position_name FROM position"; // Corrected typo here
            conn.execute(sqlReq3, (err, result) => {
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, result);
                }
            });
        }
    ];

    async.parallel(filmQueries, (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).send("An error occurred while fetching data."); // Send error response
        } else {
            console.log(results);
            res.render("addRelations", { 
                personList: results[0], 
                movieList: results[1], 
                positionList: results[2] 
            }); // Pass results to the template
        }
    });
});

// UUDISTE OSA ERALDI ROUTS FAILIGA
const newsRouter = require("./routes/newsRoutes");
app.use("/news", newsRouter);

app.get("/photoupload", (req, res)=>{
	res.render("photoupload");
});

//fotode Ã¼leslaadimise osa eraldi marsruutide failiga
const photoupRouter = require("./routes/photouploadRoutes");
app.use("/photoupload", photoupRouter);

//galerii osa eraldi marsruutide failiga
const galleryRouter = require("./routes/galleryRoutes");
app.use("/gallery", galleryRouter);


app.listen(5121);