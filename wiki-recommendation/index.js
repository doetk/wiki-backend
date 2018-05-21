

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const request = require('request');

const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver('bolt://neo4j:7687/graph', neo4j.auth.basic('neo4j', 'wikigraph'));

const app = express();

app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json());
app.use( (req,res,next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4000');
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
    res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header("Access-Control-Allow-Methods", "POST, GET, OPITONS, DELETE, PUT");
    if('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
}); // middleware



const httpServer = http.createServer(app);


app.get('/recommendations/:id', (req, res) => {
    let userid = req.params.id;
    console.log('Retrieving recommendations for ' + userid);

    const session = driver.session();
    session.run(
        'MATCH (u:User{id:$id})-[:VIEWED]->(p:Page)<-[:VIEWED]-(u2:User), \
        (u2)-[:VIEWED]->(p2:Page) WHERE p <> p2 AND NOT(u)-[:VIEWED |:EDITED |:CREATED]->(p2) \
        Return collect(distinct(p2.id));', {id: userid}
    ).then(function (result) {
        session.close();
        return res.json(result);
      })
      .catch(function (err) {
        console.log(err);
      });
});


// Retrieves all pages written by the author
// TODO - find pages in similar content
app.get('/pages/related/:authorid/:pageid', (req, res) => {

    let authorid = req.params.authorid;
    let pageid = req.params.pageid
    console.log('Getting all pages by ' + authorid);
    
    const session = driver.session();
    session.run(
        'MATCH (n:User{id:$id})-[:EDITED | :CREATED]->(p:Page) WHERE NOT (p.id = $pageid) Return collect(distinct p.id)',
        {id: authorid, pageid: pageid}
    ).then(function (result) {
        session.close();
        return res.json(result);
      })
      .catch(function (err) {
        console.log(err);
      });
})

app.post('/create/node/user', (req,res) => {
    
    let userid = req.body.userid;
    console.log('Adding USER: ' + userid + ' to graph');

    const session = driver.session();
    session.run(
        'CREATE (a: User {id: $id}) RETURN a',
        {id: userid}
    ).then(function (result) {
        session.close();
        return res.sendStatus(200);
      })
      .catch(function (err) {
        console.log(err);
      });
});

app.post('/create/node/page', (req,res) => {
    
    // Strange formatting with Spring, data is in arrays???
    let authorid = req.body.author[0] + '';
    let pageid = req.body.pageid[0];
    let title = req.body.title[0];

    console.log(authorid, pageid, title);
    
    console.log("Adding page to graph");

    const session = driver.session();


    const resultPromise = session.run(
        'MATCH (u:User{id: $author}) \
         MERGE (p:Page{id: $id, title: $title, created_on: TIMESTAMP()}) \
         MERGE (u)-[r:CREATED {date: TIMESTAMP()}]->(p)',
        {author: authorid, id: pageid, title: title}
    );

    resultPromise.then(result => {
        session.close();
        return res.status(201).json();
    }).catch ((err) => {
        console.log(err);
        return res.status(401).json(err);
    })

    

});

app.post('/create/relationship/page/edit', (req,res) => {
    let userid = req.body.userid[0] +'';
    let pageid = req.body.pageid[0];

    console.log(userid, pageid);
    console.log("Adding EDITED relationship to graph");

    const session = driver.session();

    const resultPromise = session.run(
        'MATCH (u:User{id: $userid}) \
         MATCH (p:Page{id: $id}) \
         MERGE (u)-[r:EDITED]->(p) \
         ON CREATE SET r.date=[TIMESTAMP()] \
         ON MATCH SET r.date = r.date + TIMESTAMP()',
       {userid: userid, id: pageid}
    );
    resultPromise.then(result => {
        session.close();
        return res.status(201).json();
    }).catch ((err) => {
        console.log(err);
        return res.status(401).json(err);
    })
});

app.post('/create/relationship/page/view', (req, res) => {
    let pageid = req.body.pageid;
    let userid = req.body.userid + '';
    let timeSpent = req.body.timeSpent;


    console.log(userid, pageid, timeSpent);
    console.log("Adding VIEWED relationship to graph");

    const session = driver.session();

    const resultPromise = session.run(
        'MATCH (u:User{id: $userid}) \
         MATCH (p:Page{id: $id}) \
         MERGE (u)-[r:VIEWED]->(p) \
         ON CREATE SET r.date=[TIMESTAMP()], r.timeSpent=[$time] \
         ON MATCH SET r.date = r.date + TIMESTAMP(), r.timeSpent= r.timeSpent + $time',
       {userid: userid, id: pageid, time: timeSpent}
    );
    resultPromise.then(result => {
        session.close();
        return res.status(201).json();
    }).catch ((err) => {
        console.log(err);
        return res.status(401).json(err);
    })


});


app.get('/popular', (req, res) => {
    let k = req.query.k;
    let date = Date.now();

    console.log('Getting the top ' + k + ' popular pages');

    const session = driver.session();

    // Returns the most viewed pages in the last 7 days
    const resultPromise = session.run(
        'MATCH () -[r:VIEWED]->(p:Page) \
         Return distinct p,  size(filter(x IN r.date WHERE x > ' + date + ' - 6.048e8)) as T \
        ORDER BY (T) DESC LIMIT '+ k
        
    );
    resultPromise.then(result => {
        session.close();
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.status(400).json(err);
    })
});



httpServer.listen(6161, () => {
    console.log('Recommendation Server running on 6161');
});

