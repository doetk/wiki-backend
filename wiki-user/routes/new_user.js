// notice here I'm requiring my database adapter file
// and not requiring node-postgres directly
const Router = require('express-promise-router');
const db = require('../db');
const bcrypt = require('bcrypt');
const request = require('request');

//make a new router, so instead of app.use, or apt.get, we do router.get ect..
const router = new Router();

// export our router to be mounted by the parent application
module.exports = router;

//takes posted json stringify it then substrings that because stringfy leaves ""
router.post('/', async (req, res) => {
	var newUser = req.body;
	console.log(newUser);
	//TODO: Use a real input validator
	if (!newUser.uid || !newUser.psw || !newUser.eml)
		return res.status(400).json({ message: 'Inputs invalid.' });

	if (!newUser.first) {
		newUser.first = '';
	}
	if (!newUser.last) {
		newUser.last = '';
	}
	let hash = bcrypt.hashSync(newUser.psw, 10); // hash the password and salt it

	// const { rows } = await db
	// 	.query('SELECT * FROM users WHERE username = $1', [newUser.uid])
	// 	.catch(error => {
	// 		return res.status(400).json({ message: 'User Already Exists' });
	// 	});

	//Inserts the new user into the database.
	const { rows } = await db
		.query(
			`INSERT INTO users 
    (username, passhash, first_name, last_name, email) 
    VALUES($1, $2, $3, $4, $5) RETURNING userid;`,
			[newUser.uid, hash, newUser.first, newUser.last, newUser.eml],
		)
		.catch(error => {
			return res.status(400).json({ message: 'User Already Exists' });
		});

		console.log(rows[0].userid);
	request.post({url:'http://wiki-recommendation:6161/create/node/user', form: {userid:rows[0].userid}}, (err, response, body) => {
		console.log('Sending user to recommendation graph');
	});

	//TODO: Constants for Status Codes
	return res.status(201).json({ message: 'User Added' });

	//Was using this for testing purpose probably gonna switch it to http 200 or something else.
	console.log('User Added');
});
