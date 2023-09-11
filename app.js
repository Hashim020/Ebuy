require('dotenv').config();
const mongoose = require("mongoose");
mongoose.connect(process.env.mongooseconnectURL);

const express = require("express");
const app = express();
app.use(express.json())
app.set('view engine','ejs')
app.set('views','./Views/User');
app.set('views','./Views/Admin');


app.use(express.static('Views/User'))
app.use(express.static('Views/Admin'))
app.use(express.static('images'))

const userRoute = require('./Routes/userRoute')
app.use('/',userRoute)

const adminRoute = require('./Routes/AdminRoute')
app.use('/admin',adminRoute)

app.use('*',(req,res)=>{
    res.send('404 error')
})

app.listen(3000,()=>{
    console.log("Server is Running: http://localhost:3000");
})


