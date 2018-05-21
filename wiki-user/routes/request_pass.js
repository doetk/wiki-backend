const Router = require('express-promise-router');
const db = require('../db');
const nodemailer = require('nodemailer');

const router = new Router();

// export our router to be mounted by the parent application
module.exports = router

//takes posted json stringify it then substrings that because stringfy leaves ""
router.post('/', async (req, res) => {
  
  var userEmail = req.body;
  const { rows }  = await db.query('SELECT userid FROM users WHERE email = $1', [userEmail.eml]);

  if(rows[0] == undefined){
    console.log("You dont have an account!");
    res.sendStatus(400);
  }
  else{
    nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                proxy: process.env.http_proxy
                // auth: {
                //     user: account.user, // generated ethereal user
                //     pass: account.pass  // generated ethereal password
                // }
            });
        
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Adamin" <admin@wiki.com>', // sender address
                to: userEmail.eml, // list of receivers
                subject: 'Password Reset', // Subject line
                text: 'Plese click this link to reset youur password...', // plain text body
                html: '<b>Plese click this link to reset youur password...</b>' // html body
            };
            console.log("HERE!!!!!!!!!!!");
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });

            res.sendStatus(201);
        });
    }
});