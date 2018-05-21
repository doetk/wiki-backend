// notice here I'm requiring my database adapter file
// and not requiring node-postgres directly
const Router = require('express-promise-router'); // express promise
const db = require('../db') // database 
const bcrypt = require('bcrypt'); // for increpting password
const jwt = require('jsonwebtoken');
const jwtConstants = require('../jwtConstants');

//make a new router, so instead of app.use, or apt.get, we do router.get ect..
const router = new Router();

// export our router to be mounted by the parent application
module.exports = router

//making the token
const issueJWT = (user) => {
  return jwt.sign({'type': 'auth'},
    jwtConstants.jwtSecret,
    {issuer: jwtConstants.appTLD,
    subject: user,
    algorithm: jwtConstants.jwtAlgo,
    expiresIn: jwtConstants.jwtExpiration
    }
  );
}

//post to get the info on user password
router.post('/', async (req, res) => {
    var userInfo = req.body; // read in user info (user id and pass)
    try{
	
    	const { rows }  = await db.query(
		'SELECT passhash, userid FROM users WHERE username = $1',
		[userInfo.uid]); // search the database if it's right
    	// verify password
    	if(bcrypt.compareSync(userInfo.psw, rows[0].passhash)) {
      	    // issueing out the cookie and token
      	    res.cookie('auth-token',
                issueJWT(rows[0].userid+''),
                { httpOnly: true,
                //secure: true
                }
            );
            //res.redirect('/api/v1/users/' + userInfo.uid); // sends you /api/v1/users/(youruid)
            res.status(200).json({'userid': rows[0].userid});
        }
        else {
            // password is wrong
            return res.status(401).json({'message': 'Invalid credentials'});
        }
    }
    catch (e) {
    	return res.status(401).json({'message': 'Invalid credentials'});
    }
});

  
