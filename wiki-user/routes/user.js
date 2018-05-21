const Router = require('express-promise-router');
const db = require('../db');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const logger = require('log4js').getLogger('User Service');
const bcrypt = require('bcrypt');

//make a new router, so instead of app.use, or apt.get, we do router.get ect..
const router = new Router();

const jwtConstants = require('../jwtConstants');

// export our router to be mounted by the parent application
module.exports = router;

router.use(cookieParser());

//How the application checks the token
const checkJWT = token => {
	try {
		const payload = jwt.verify(token, jwtConstants.jwtSecret, {
			algorithms: jwtConstants.jwtAlgo,
			issuer: jwtConstants.appTLD,
		});
		return payload.sub;
	} catch (err) {
		logger.info('JWT Invalid' + err);
		return false;
	}
};

//Checks token
router.use(function(req, res, next) {
	const uid = checkJWT(req.cookies['auth-token']);
	if (uid) {
		req.authStatus = { uid: uid, loggedIn: true };
		return next();
	}
	req.authStatus = { uid: null, loggedIn: false };
	next();
});

router.get('/isLoggedIn', async (req, res) => {
	return res.status(200).json(req.authStatus);
});

router.get('/:id', async (req, res) => {
	const { id } = req.params;

	if (!req.authStatus.loggedIn) {
		// Sees if I'm  not logged in.
		res.status(401);
		return res.json({
			status: 'error',
			message: 'Not logged in.',
		});
	}

	if (req.authStatus.uid !== id) {
		// Checks that I'm looking at my own uid
		return res.status(400).json({ status: 'error', message: 'Not your info.' });
	}

	const { rows } = await db.query(
		'SELECT username, first_name, last_name, email FROM users WHERE userid = $1',
		[id],
	);

	return res.status(200).send(rows[0]);
});

// ********************************************************************************
// So thst we can get the name of the author/user who edited a page
// ********************************************************************************

router.get('/author/:id', async (req, res) => {
	const { id } = req.params;

	const { rows } = await db.query(
		'SELECT first_name, last_name FROM users WHERE userid = $1',
		[id],
	);

	return res.status(200).send(rows[0]);
});


router.get('/last-logout/:id', async(req, res) => {
	const id = req.params.id;
	const rows = await db.query('SELECT last_logout FROM users WHERE userid = $1', [id]);

	return res.status(200).send(rows.rows[0]);
});

/** method to update a user's data in the database
 * User must be logged in
 * User can change only their data
 * User must provide password to authorize change
 * A changed username must not already exist
 * A changed email must not already exist
 */
router.put('/update/info', async (req, res) => {
	console.log(req.body.user);
	if (!req.authStatus.loggedIn) {
		// Sees if I'm  not logged in.
		res.status(401);
		return res.json({
			status: 'error',
			message: 'Not logged in.',
		});
	}

	if (req.body.password == undefined) {
		return res.status(400).json({message: 'Missing password'});
	}

	// Check to see if user has entered correct password to authorize data change
	const { rows } = await db.query(
		'SELECT passhash FROM users WHERE userid = $1',
		[req.authStatus.uid],
	); // search the database if it's right
	// verify password

	if (bcrypt.compareSync(req.body.password, rows[0].passhash)) {
		// TODO update data in database

		let query = updateUserById(req.authStatus.uid, req.body.user);
		let colValues = [];
		Object.keys(req.body.user).filter(key => {
			colValues.push(req.body.user[key]);
			return req.body.user[key];
		});
		
		// gathers all strings within parentheses, use for returning error messages
		const regex = /\(([^)]+)\)/;

		console.log('Executing: ' + query + 'Params: ' + colValues);
		try {
			await db.query(query, colValues);

			// console.log('passwords match');
			return res.status(204).json({ message: 'Info updated' }); 
		}
		catch(error) {
			return res.status(409).json({message: regex.exec(error.detail)[1]});
		}
	} else {
		// password is wrong
		return res.status(401).json({ message: 'Invalid credentials' });
	}
});

// updates user's password in the database
router.put('/update/password', async (req, res) => {
	if (!req.authStatus.loggedIn) {
		// Sees if I'm  not logged in.
		res.status(401);
		return res.json({
			status: 'error',
			message: 'Not logged in.',
		});
	}

	// Check to see if user has entered correct password to authorize data change
	const { rows } = await db.query(
		'SELECT passhash FROM users WHERE userid = $1',
		[req.authStatus.uid],
	); // search the database if it's right
	// verify password
	if (bcrypt.compareSync(req.body.user.oldPassword, rows[0].passhash)) {
		let hash = bcrypt.hashSync(req.body.user.newPassword, 10); // hash the password and salt it
		await db.query(
			'UPDATE users SET passhash = ($1) where userid = ' +
				req.authStatus.uid,
			[hash],
		);
		console.log('updated password');
		return res.status(204).json({ message: 'Info updated' });
	} else {
		// password is wrong
		return res.status(401).json({ message: 'Invalid credentials' });
	}
});

// returns query statement to be used for updating user information
function updateUserById(id, cols) {
	// fields that can be updated: username, passhash, first_name, last_name, email
	let query = ['UPDATE users'];
	query.push('SET');

	let set = [];
	Object.keys(cols).forEach((key, i) => {
		set.push(key + ' = ($' + (i + 1) + ')');
	});
	query.push(set.join(', '));

	query.push('WHERE userid = ' + id);

	return query.join(' ');
}
