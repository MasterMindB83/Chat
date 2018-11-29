const http = require('http');
const mysql=require('mysql');
const express=require('express');
const app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server);
var bodyParser = require('body-parser');
const pool = mysql.createPool({
    connectionLimit: 1000,
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'chat'
});
pool.getConnection((err,connection) => {
    if(err)
        connection.release();
    else{
        mySqlConnection = connection;
        console.log('Connection successful.');
        
    }
});
var users=[];
app.use(bodyParser.json());

app.get('/messages/:from/:to/:index',(req,res) => {
    let sql = "select x.* from (select from_user, to_user, message, date, @row_number:=@row_number + 1 AS row,seen from messages,(select @row_number := 0) r where (from_user like ? and to_user like ?) or (from_user like ? and to_user like ?) order by id) x "+
               "where x.row <= ? and x.row > ?";
    /*let sql2="update messages set seen=1 where id in (select id from (select id,from_user, to_user, message, date,seen,@row_number:=@row_number + 1 AS row from messages,"+
                                                                     "(select @row_number := 0) r where from_user like ? and to_user like ? order by id) x"+
                                                                     " where x.row <= ? and x.row > ?)"*/
    let sql2 = "update messages set seen=1 where from_user = ? and to_user = ?";
    mySqlConnection.query(sql2,[req.params.to,req.params.from],(err, rows, fields) => {
        if(err)
            console.log(err);
        else
            console.log(rows);
    });
    mySqlConnection.query(sql,[req.params.from,req.params.to,req.params.to,req.params.from,req.params.index,req.params.index-7],(err, rows, fields) => {
        if(err)
          console.log(err);
        else
          res.send(rows);
    });
    //io.in(req.body.to_user).emit('seen',{from: req.params.to,to: req.params.from});
    
});
app.get('/usersno',(req,res) => {
    let sql = "select count(*) from users";
    mySqlConnection.query(sql,(err, rows, fields) => {
        if(err)
          console.log(err);
        else
          res.send(rows);
    });
});
app.get('/users',(req,res) => {
    let sql = "select * from users";
    mySqlConnection.query(sql,(err, rows, fields) => {
        if(err)
          console.log(err);
        else
          res.send(rows);
    });
});
app.get('/messagesno/:from/:to',(req,res) => {
    let sql = "select count(1) messagesno from messages where (from_user like ? and to_user like ?) or (from_user like ? and to_user like ?)";
    if(req.params.to == 'all') {
      sql="select  count(*) messagesno from messages where from_user like ? or to_user like ?";
      mySqlConnection.query(sql,[req.params.from,req.params.to],(err, rows, fields) => {
          if(err)
            console.log(err);
          else
            res.send(rows);
      });
    } else{
            mySqlConnection.query(sql,[req.params.from,req.params.to,req.params.to,req.params.from],(err, rows, fields) => {
                if(err)
                  console.log(err);
                else
                  res.send(rows);
            });
    }
});

app.get('/users/:id',(req,res) => {
    let sql = "select * from users wher id=?";
    mySqlConnection.query(sql,[req.params.id],(err, rows, fields) => {
        if(err)
          console.log(err);
        else
          res.send(rows);
    });
});
app.get('/usersexceptcurrent/:user',(req,res) => {
    let sql = "select * from users where username <> ?";
    mySqlConnection.query(sql,[req.params.user],(err, rows, fields) => {
        if(err)
          console.log(err);
        else
          res.send(rows);
    });
});
app.post('/login',(req,res) => {
    let sql = "select count(*) count from users where username=? and password=?";
    mySqlConnection.query(sql,[req.body.username,req.body.password],(err, rows, fields) => {
        if(err)
          console.log(err);
        else{
            res.send(rows);
        }
    });
});
app.post('/sendmessage',(req,res) => {
    let sql = "insert into messages(from_user,to_user,message,date,seen) values(?,?,?,?,0)";
    let date = Date.now();
    mySqlConnection.query(sql,[req.body.from_user,req.body.to_user,req.body.message,date],(err,rows,fields) => {
        if(err)
          console.log(err);
        else{
            io.in(req.body.to_user).emit('new-message',{from: req.body.from_user,to: req.body.to_user});
            res.send(rows);
        }
    });
});
app.post('/online',(req,res) => {
    let sql = "update users set online=? where username like ?";
    mySqlConnection.query(sql,[req.body.online,req.body.username],(err,rows,fields) => {
        if(err)
          console.log(err);
        else{
            res.send(rows);
        }
    });
});
app.post('/adduser',(req,res) => {
    let sql = "insert into users(username, name, password) values(?,?,?)";
    mySqlConnection.query(sql,[req.body.username,req.body.name,req.body.password],(err,rows,fields) => {
        if(err)
            console.log(err);
        else
            res.send(rows);
    });
});
io.on('connection',(socket) => {
    
    console.log('New connection made.');
    socket.on('join',(data) => {
        socket.join(data.user);
        users[socket.id]=data.user;
        console.log(socket.id);
        console.log(users[socket.id]);
    });
    socket.on('typing',(data) => {
        io.in(data.to).emit('typing',data);
    });
    socket.on('typing end',(data) => {
        io.in(data.to).emit('typing end',data);
    });
    socket.on('seen',(data) => {
        io.in(data.to).emit('seen',data);
    });
    socket.on('online',(data) => {
        console.log('User '+data.username + ' is online');
        io.sockets.emit('online',data);
    });
    socket.on('disconnect',() =>{
        console.log('user '+ users[socket.id]+' has disconnected')
        let sql = "update users set online=? where username like ?";
        mySqlConnection.query(sql,[0,users[socket.id]],(err,rows,fields) => {
            if(err)
              console.log(err);
            else{
                io.sockets.emit('online',{user: users[socket.id]});
            }
        });
    });
});
server.listen(3001,(err) => {
    if(err)
        console.log(err);
    else
        console.log('Listening on port 3001.')
});