const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");

const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//@desc home page for news section
//@route GET /news
//@access private

const newsHome = (req, res)=>{
	console.log("Tootab uudiste router koos kontrolleriga");
	res.render("news");
};

//@desc page for adding news
//@route GET /news/addnews
//@access private

const addNews = (req, res)=>{
	res.render("addnews");
};

//@desc adding news
//@route POST /news/addnews
//@access private

const addingNews = (req, res)=>{
	if(!req.body.titleInput || !req.body.newsInput || !req.body.expireInput){
		console.log('Uudisega jama');
		notice = 'Andmeid puudu!';
		res.render('addnews', {notice: notice});
	}
	else {
		let sql = 'INSERT INTO vp1_news (news_title, news_text, expire_date, user_id) VALUES(?,?,?,?)';
		//let userid = 1;
		//andmebaasi osa
		conn.execute(sql, [req.body.titleInput, req.body.newsInput, req.body.expireInput, req.session.userId], (err, result)=>{
			if(err) {
				throw err;
				notice = 'Uudise salvestamine ebaÃµnnestus!';
				res.render('addnews', {notice: notice});
			} else {
				notice = 'Uudis edukalt salvestatud!';
				res.render('addnews', {notice: notice});
			}
		});
		//andmebaasi osa lÃµppeb
	}
};

//@desc page for reading news headings
//@route POST /news/read
//@access private

const newsHeadings = (req, res) => {
    const sql = "SELECT id, news_title, news_text FROM vp1_news WHERE expire_date > ? ORDER BY id DESC";
    
    conn.execute(sql, [new Date()], (err, result) => {
        if (err) {
            // Handle the error appropriately
            const news = [{ id: 0, news_title: "Uudiseid pole!" }];
            const notice = 'Uudiste lugemine ebaõnnestus! ' + err.message; // Use err.message for a cleaner error message
            res.render('readnews', { news: news, notice: notice }); // Pass the notice to the view if needed
        } else {
            const notice = 'Uudised edukalt loetud!';
            res.render('readnews', { news: result, notice: notice }); // Pass the notice to the view if needed
        }
    });
};

module.exports = {
    newsHome, 
    addNews,
    addingNews,
    newsHeadings
};