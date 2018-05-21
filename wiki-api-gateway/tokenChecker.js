const request = require('request-promise-native');
const tough = require('tough-cookie');

module.exports = (host, port, prefix) => {
  const serviceLocation = 'http://' + host + ':' + port + prefix;
  return async (req, res, next) => {
    
    if(!req.cookies['auth-token']){
      req.headers['authStatus'] = false;
      req.headers['uid'] = null;
      return next();
    }
  
    const url = serviceLocation + '/users/isLoggedIn';
    
    let jar = request.jar();
    jar._jar.rejectPublicSuffixes = false
    const authCookie = new tough.Cookie({
      key: "auth-token",
      value: req.cookies['auth-token'],
      domain: host,
      httpOnly: true,
      maxAge: 31536000
    });
    jar.setCookie(authCookie, 'http://' + host);
    
    //TODO: HOLY CRAP, ERROR CHECKING BATMAN
    try{
      const authDetails = await request({uri: url, jar: jar, method: "GET"});
      const authDetailsObj = JSON.parse(authDetails);
      req.headers['authStatus'] = authDetailsObj.loggedIn || false;
      req.headers['uid'] = authDetailsObj.uid || null;
      next();
    }
    catch(err){
      req.headers['authStatus'] = false;
      req.headers['uid'] = null;
      next();
    }
  }
}

