const app  = require('express')()
const express = require('express');
const http = require('http').createServer(app)
const cors = require('cors')
const mongoose = require('mongoose');
const userModel = require(__dirname + '/models/User');

const gmModel = require(__dirname + '/models/Message');

const PORT = 9000 || process.env.PORT;

//create server side socket
const io = require('socket.io')(http)




app.use(cors())
users = []

io.on('connection', (socket) => {
    console.log('Connected ')
    
    socket.emit('welcome', 'Welcome to Socket Programming : ' + socket.id)
    //console.log(socket)
  
    socket.on('message', (data) => {
        if(data.room == '' || data.room==undefined){
            io.emit('newMessage', socket.id + ' : ' + data.message)
        }else{
          
          io.to(data.room).emit('newMessage', socket.id +' : ' + data.message)
          if(data.room=='news'||data.room=='covid'||data.room=='nodeJs'){
            const gm = new gmModel({from_user:socket.id,room:data.room,message:data.message});
            try {
              gm.save();
            } catch (err) {
              console.log(err);
            }
          }
          else{
            const pm= new pmModel({from_user:socket.id,to_user:room,message:data.message})
            try {
              pm.save();
            } catch (err) {
              console.log(err);
            }
          }
        }
  
    })


    //custom message socket
    socket.on('message', (data) => {
        console.log(data)

        if(data.room == '' || data.room==undefined){
            io.emit('newMessage', socket.id + ' : ' + data.message)
        }else{
          console.log(data)
          io.to(data.room).emit('newMessage', socket.id +' : ' + data.message)
          //if(data.room=='news'||data.room=='covid'||data.room=='nodeJs'){
            
          
        }
  
    })
  
    //Get User name
    socket.on('newUser', (name) => {
        if(!users.includes(name)){
            users.push(name)
        }
        socket.id = name
    })
    
    //Group/Room Join
    socket.on('joinroom', (room) => {
        console.log(room)
        socket.join(room)
        roomName = room
        socket.currentRoom = room;
        const msg = gmModel.find({room: room}).sort({'date_sent': 'desc'}).limit(10);
        socket.msg=msg
    })
    socket.on('leaveRoom', () =>{
        socket.leave(socket.currentRoom);
        socket.currentRoom = null;
        console.log(socket.rooms);
    })
    //Disconnected
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
    })
  })


app.use(
    express.urlencoded({
      extended: true
    })
  )
  
app.use(express.json());
mongoose.connect('mongodb+srv://namya09:namya09@comp3123.ckb9j.mongodb.net/db_f2021_comp3123?retryWrites=true&w=majority', 
{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(success => {
  console.log('Success Mongodb connection')
})
.catch(err => {
  console.log('Error Mongodb connection')
});





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
  
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html")
})

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
app.get("/index", (req,res) =>{
    res.sendFile(__dirname + "/index.html")
})

app.get("/main", (req, res) => {
    res.sendFile(__dirname + "/main.html")
})


app.get('/main/:room', async (req, res) => {
    const room = req.params.room
    const msg = await gmModel.find({room: room}).sort({'date_sent': 'desc'}).limit(10);
    res.sendFile(__dirname + '/main.html')
  });



app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html")
})




http.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})