const express = require('express');
const dbInfo = require("../../vp2024config");
const mysql = require('mysql2');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

const conn = mysql.createConnection({
    host: dbInfo.configData.host,
    user: dbInfo.configData.user,
    password: dbInfo.configData.passWord,
    database: dbInfo.configData.dataBase,
});

conn.connect((err) => {
    if (err) {
        console.error('Veebiserver ei saa andmebaasiga ühendust!', err);
        return;
    }
    console.log('Ühendatud andmebaasiga.');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.redirect("/viljavedu");
});

app.get('/viljavedu', (req, res) => {
    res.render('viljavedu');
});

app.get('/insert_truck_data', (req, res) => {
    res.render('insert_truck_data');
});

app.get('/summary_truck', (req, res) => {
    conn.query('SELECT * FROM vp1viljavedu', (err, results) => {
        if (err) {
            console.error('Andmete lugemine ebaõnnestus:', err);
            return res.status(500).json({ success: false, message: 'Andmete lugemine ebaõnnestus.' });
        }
        res.render('summary_truck', { vehicles: results });
    });
});

app.post("/insert_truck_data", (req, res) => {
    let notice = "";
    let truck = req.body.truck || "";
    let weight_in = req.body.weight_in || "";
    let weight_out = req.body.weight_out || "";

    if (!truck || !weight_in || !weight_out) {
        notice = "Osa andmeid sisestamata"; 
        return res.render("insert_truck_data", { notice: notice, truck: truck, weight_in: weight_in, weight_out: weight_out });
    }

    let sqlreq = "INSERT INTO vp1viljavedu (truck, weight_in, weight_out) VALUES (?, ?, ?)";
    conn.query(sqlreq, [truck, weight_in, weight_out], (err, sqlres) => {
        if (err) {
            console.error('Andmete salvestamine ebaõnnestus:', err);
            notice = "Andmete salvestamine ebaõnnestus."; 
            return res.render("insert_truck_data", { notice: notice, truck: truck, weight_in: weight_in, weight_out: weight_out });
        }

        notice = "Andmed edukalt sisestatud!";
        res.redirect("/summary_truck");
    });
});

app.listen(5121);