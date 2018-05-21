// ./routes/index.js

//Requires all of the files in the routes folder.
const users = require('./user');
const new_user = require('./new_user');
const login = require('./login');
const request = require('./request_pass');
const logout = require('./logout');

//Exports out a file path to app.js 
module.exports = (app) => {
  app.use('/api/v1/users', users)
  app.use('/api/v1/newuser', new_user)
  app.use('/api/v1/login', login)
  app.use('/api/v1/request', request)
  //app.use('/api/v1/reset', reset) //This is only temp. We need to figure ouut how to randomize the url
  app.use('/api/v1/logout', logout)
}

