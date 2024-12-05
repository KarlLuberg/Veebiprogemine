const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
const async = require("async");

const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//@desc opening page for gallery
//@route GET /gallery
//@access private

const galleryOpenPage = (req, res) => {
	res.redirect("/gallery/1");
};

const galleryPage = (req, res)=>{
    let galleryLinks = "";
	let page = parseInt(req.params.page);
	if(page < 1){
		page = 1;
	}
	const photoLimit = 5;
	let skip = 10;
	const privacy = 3;
	
	//teeme pÃ¤ringud, mida tuleb kindlalt Ã¼ksteise jÃ¤rel teha
	const galleryPageTasks = [
		function(callback){
			conn.execute("SELECT COUNT(id) as photos FROM vp1_photos WHERE privacy = ? AND deleted IS NULL", [privacy], (err, result) => {
				if(err){
					return callback(err);
				}
				else {
					return callback(null, result);
				}
			});
		},
		function(photoCount, callback){
			console.log("Fotosid on: " + photoCount[0].photos);
			if((page - 1) * photoLimit >= photoCount[0].photos){
				page = Math.ceil(photoCount[0].photos / photoLimit);
			}
			console.log("LehekÃ¼lg on: " + page);
            //lingid oleksid
            //<a href="/gallery/1">eelmine leht</a> | <a href="/gallery/3">j2rgmine leht</a>
            if(page == 1){
                galleryLinks = "eelmine leht &nbsp;&nbsp;| &nbsp;&nbsp"
            }
            else {
                galleryLinks = '<a href="/gallery/' + (page - 1) + '"> eelmine leht &nbsp;&nbsp;| &nbsp;&nbsp;';
            }
            if(page * photoLimit >= photoCount[0].photos){
                galleryLinks += "järgmine leht";
            }
            else {
                galleryLinks += '<a href="/gallery/' + (page + 1) + '"> järgmine leht</a>';
            }
			return callback(null, page);
		}
	];
	//async waterfall
	async.waterfall(galleryPageTasks, (err, results)=>{
		if(err){
			throw err;
		}
		else {
			console.log(results);
		}
	});
	
    skip = (page - 1) * photoLimit;
	let sqlReq = "SELECT file_name, alt_text FROM vp1_photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC LIMIT ?,?";
	
	let photoList = [];
	conn.execute(sqlReq, [privacy, skip, photoLimit], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			console.log(result);
			for(let i = 0; i < result.length; i ++) {
				photoList.push({href: "/gallery/thumb/" + result[i].file_name, alt: result[i].alt_text, fileName: result[i].file_name});
			}
			res.render("gallery", {listData: photoList, links: galleryLinks});
		}
	});
	//res.render("gallery");
};

module.exports = {
	galleryOpenPage,
	galleryPage};