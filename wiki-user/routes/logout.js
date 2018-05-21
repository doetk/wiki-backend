
const Router = require('express-promise-router'); // express promise
const db = require('../db'); // database
const cookieParser = require('cookie-parser');
const moment = require('moment');

//make a new router, so instead of app.use, or apt.get, we do router.get ect..
const router = new Router();

router.use(cookieParser());

// export our router to be mounted by the parent application
module.exports = router

router.put("/", async(req, res)=>{
    user = req.headers['uid'];
    if(user != "null"){
        await db.query('UPDATE users set last_logout = $1 WHERE userid = $2', [moment().utc(), user]);
    }
    res.clearCookie('auth-token'); 
    res.status(200).send({message: "Logged Out"});
});
