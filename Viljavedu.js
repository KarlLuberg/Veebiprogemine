const express = require('express');
const dbInfo = require("../../vp2024config");
console.log(dbInfo);
const mysql = require('mysql2');
const bodyParser = require('body-parser');
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

app.get('/', (req, res) => {
    res.redirect("viljavedu");
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

app.post("/summary_truck", (req, res) => {
    let notice = "";
    let truck = "";
    let weight_in = "";
    let weight_out = "";

    if (!req.body.truckInput || !req.body.weightInInput || !req.body.weightOutInput) {
        truck = req.body.truckInput || "";
        weight_in = req.body.weightInInput || "";
        weight_out = req.body.weightOutInput || "";
        notice = "Osa andmeid sisestamata";
        res.render("summary_truck", { notice: notice, truck: truck, weight_in: weight_in, weight_out: weight_out });
    } else {
        let sqlreq = "INSERT INTO vp1viljavedu (truck, weight_in, weight_out) VALUES (?, ?, ?)";
        conn.query(sqlreq, [req.body.truckInput, req.body.weightInInput, req.body.weightOutInput], (err, sqlres) => {
            if (err) {
                console.error('Andmete salvestamine ebaõnnestus:', err);
                notice = "Andmete salvestamine ebaõnnestus.";
                res.render("summary_truck", { notice: notice, truck: truck, weight_in: weight_in, weight_out: weight_out });
            } else {
                notice = "andmed sisestatud";
                res.render("summary_truck", { notice: notice, truck: "", weight_in: "", weight_out: "" }); // Tühjendame väljundid pärast salvestamist
            }
        });
    }
});

app.listen(5121);