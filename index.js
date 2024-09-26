const express = require("express");
const app = express();

app.get("/", (req, res)=>{
    res.send("express l2ks t2iesti k2ima!");
});

app.listen(5121);