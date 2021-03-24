require('dotenv').config();
const express = require('express');
const session =require('express-session');
const app = express();
const massive = require('massive');
const authCtrl = require('./controllers/authCtrl');

const { SERVER_PORT,CONNECTION_STRING, SESSION_SECRET } = process.env;
app.use(express.json());

app.use(session({
  secret:SESSION_SECRET,
  resave:false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  }

}));

//-------------AUTH Endpoints------------------
app.post('/auth/register', authCtrl.register);
app.post('/auth/login', authCtrl.login);
app.delete('/auth/logout', authCtrl.logout);
//-------------------------------------------

massive ({
    connectionString: CONNECTION_STRING,
    ssl:{
      rejectUnauthorized:false
    }
  })
    .then(dbInst => {
      app.set('db',dbInst)
        
      app.listen(SERVER_PORT,() => console.log(`Server running on port` + ' ' +SERVER_PORT))
    })
    .catch(err => console.log(err));