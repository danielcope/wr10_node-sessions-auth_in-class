const bcrypt = require('bcryptjs');

module.exports = {
  register: async (req,res) => {
    // Receive user into the DB
    const db = req.app.get('db');

    // Receive user info to add the user
    const {name,email,password,admin} = req.body;

    // Check if there is a user with the same email and reject 
    try {
      const [existingUser] = await db.check_user_by_email(email);

      if (existingUser) {
        return res.sendStatus(409).send('User already exists')
      }

      // hash and salt password
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      
      // add user to the db users table and get back their id
      const [ newUser ] = await db.register_user(name,email,hash,admin);

      // create session for the user using the db response
      req.session.user = newUser;
      
      // send the response that includes the user session info
      res.status(200).send(newUser);

    } catch(err) {
      console.log(err)
      return res.sendStatus(500)
    }
  },

  login: (req,res) => {
    // get db instance
    const db = req.body('db')
    // get necessary info from req.body (hash)
    const {email,password} = req.body
    // check if user exists, if the do NOT, reject request
    db.check_user_by_email(email)
      .then(([existingUser]) => {
        if(!existingUser) {
          return res.status(403).send('User with that email does not exist')
        }
        //compare password from req.body with the stored hash that was retrieved. if the don't match, reject.
        const isAuthenticated = bcrypt.compareSync(password,existingUser.hash)

        if (!isAuthenticated) {
          return res.status(407).send('Incorrect password')
        }
        // set up our session and be sure to not include the hash in the session
        delete existingUser.hash

        req.session.user = existingUser;
        // send the response and session to the front
        res.status(200).send(req.session.user)
      })
  },
  logout: (req,res) => {
    req.session.destroy();
    res.sendStatus(200);
  }
}