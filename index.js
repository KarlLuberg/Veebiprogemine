const express = require("express");
const dtEt = require ("./dateTime");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res)=>{
    //res.send("express l2ks t2iesti k2ima!");
    res.render("index.ejs");
});

app.get("/timenow", (req, res)=>{
    const weekdayNow = dtEt.weekDay();
    const dateNow = dtEt.dateFormatted();
    const timeNow = dtEt.timeFormatted();
    res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowT: timeNow});
});

app.listen(5121);