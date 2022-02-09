const app  = require('express')()
const express = require('express');
const http = require('http').createServer(app)
const cors = require('cors')
const mongoose = require('mongoose');
const userModel = require(__dirname + '/models/User');


const PORT = 9000 || process.env.PORT;

//create server side socket
const io = require('socket.io')(http)

app.use(cors())
app.use(
    express.urlencoded({
      extended: true
    })
  )
  
  app.use(express.json());
mongoose.connect('mongodb+srv://namya09:namya09@comp3123.ckb9j.mongodb.net/db_f2021_comp3123?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(success => {
  console.log('Success Mongodb connection')
}).catch(err => {
  console.log('Error Mongodb connection')
});



app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/signup.html")
})

app.post('/login', async (req, res) => {
    const user = new userModel(req.body);
    try {
      await user.save((err) => {
        if(err){
            if (err.code === 11000) {
               return res.redirect('/signup?err=username')
            }
          
          res.send(err)
        }else{
          res.sendFile(__dirname + '/login.html')
        }
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });

app.post('/', async (req, res) => {
    const username=req.body.username
    const password=req.body.password

    const user = await userModel.find({username:username});

    try {
        if(user.length != 0){
        if(user[0].password==password){
            return res.redirect('/?uname='+username)
        }
        else{
            return res.redirect('/login?wrong=pass')
        }
        }else{
        return res.redirect('/login?wrong=uname')
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
app.get("/", (req,res) =>{
    res.sendFile(__dirname + "/index.html")
})

app.get("/main.html", (req, res) => {
    res.sendFile(__dirname + "/main.html")
})



app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html")
})




http.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})