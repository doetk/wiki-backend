var promise = require("bluebird");

const base_url = "/api/v1/pages";

var options = {
	// Initialization Options
	promiseLib: promise
};

var pgp = require("pg-promise")(options);
var connectionString = "postgres://docker:dragon@postgres:5432/wiki";
var db = pgp(connectionString);

// Request URL: GET url.com/api/v1/pages
// Request Params: None
/* Response Body: Pages: {
       [{"title":"Example Title", 
	   "route": "/api/v1/pages/example_title",}
	   ...
	   ]
	}*/
function getAllPages(req, res, next) {
	db
		// .any("SELECT DISTINCT pageid, title, pagedata FROM page")
	.any("SELECT pageid, title, revisionid, pagedata FROM page p1 WHERE p1.revisionid = (SELECT MAX(revisionid) FROM page p2 WHERE 			p2.pageid = p1.pageid)")

// SELECT pageid, title, revisionid, pagedata from page p1 where p1.revisionid = (SELECT MAX(revisionid) from page p2 where p2.pageid = p1.pageid)


		.then(function(data) {
			if (data.length === 0) {
				res.status(404);
				//return Promise.reject("404 Page no Found");
			}
			var r = [];

			for (var row in data) {
				r.push({
					title: data[row].title,
					route: data[row].pageid,
					description: data[row].pagedata,
					// shortRoute: data[rowr].pageid
				});
			}

			return Promise.resolve(res.status(200).json(r));
		})
		.catch(function(err) {
			return next(err);
		});
}

/*Request URL: GET url.com/api/v1/pages/id
  Request Params: pageID
  Response Body: {[{
              "pageid": "example_title",
              "revisionid": 201,
              "title": "Example Title",
              "modified": "2017-11-01T00:00:00",
              "author": "JuicyKitten",
              "pagedata": "Lorem *ipsum* dolor sit amet, consectetur adipiscing elit, ~sed do eiusmod te"
              "revisions": [
                  { "revision_id": "1", "route": "/api/v1/pages/example_title/revisions/1" },
                  { "revision_id": "2", "route": "/api/v1/pages/example_title/revisions/2" },
                  {.....}
        }]
	}*/
function getSinglePage(req, res, next) {
	var pageid = req.params.id.toUpperCase();
	db
		.any(
			"SELECT * FROM page p WHERE p.pageid = $1 AND p.revisionid = (SELECT MAX(i.revisionid) FROM page i WHERE i.pageid = $1)",
			pageid
		)
		.then(function(data) {
			var rows = [];
			var revs = [];

			if (data.length === 0) {
				res.status(404).send(err);
			}

			for (var row in data) {
				for (i = 0; i < data[row].revisionid; i++) {
					revs.push({
						RevisionID: i,
						route:
							base_url +
							"/" +
							data[row].pageid +
							"/" +
							"revisions" +
							"/" +
							i
					});
				}
				rows.push({
					pageid: data[row].pageid,
					revisionid: data[row].revisionid,
					title: data[row].title,
					modified: data[row].modified,
					author: data[row].author,
					pagedata: data[row].pagedata,
					revisions: {
						route: revs
					}
				});
			}
			return Promise.resolve(res.status(200).json(rows));
		})
		.catch(function(err) {
			return next(err);
		});
}
// Request URL: GET url.com/api/v1/pages/id/current
// Request Params: pageID
/* Response Body: {[{
              "pageid": "example_title",
              "title": "Example Title",
              "modified": "2017-11-01T00:00:00",
              "author": "JuicyKitten",
              "pagedata": "Lorem *ipsum* dolor sit amet, consectetur adipiscing elit, ~sed do eiusmod tempor~ incididunt ut labore...",}
        }]
  }*/
function getCurrentPage(req, res, next) {
	var pageid = req.params.id.toUpperCase();
	db
		.any(
			"SELECT * FROM page p WHERE p.pageid = $1 AND p.revisionid = (SELECT MAX(i.revisionid) FROM page i WHERE i.pageid = $1)",
			pageid
		)
		.then(function(data) {
			if (data.length === 0) return Promise.reject("404 Page not Found");

			res.status(200).json(data);
		})
		.catch(function(err) {
			return next(err);
		});
}

// Request URL: GET url.com/api/v1/pages/:pageid/revisions/:revid
// Request Params: pageid, revisionid
/* Response Body: {[{
            "id": "example_title",
            "title": "Example Title",
            "modified": "2017-11-01T00:00:00",
            "author": "JuicyKitten",
            "pagedata": "Lorem *ipsum* dolor sit amet, consectetur adipiscing elit, ~sed do eiusmod tempor~ incididunt ut labore...",
        }]
  }*/
function getRevisionPage(req, res, next) {
	var pageid = req.params.pageid.toUpperCase();

	var revid = parseInt(req.params.revid);

	// if (typeof revid === undefined){
	//   return res.status(400).send("Bad request");
	// }

	db
		.any(
			"SELECT pageid, title, modified, author, pagedata FROM page WHERE pageid = $1 AND revisionid = $2",
			[pageid, revid]
		)
		.then(function(data) {
			if (data.length === 0) return Promise.reject("404 Page not Found");

			return Promise.resolve(res.status(200).json(data));
		})
		.catch(function(err) {
			return next(err);
		});
}

module.exports = {
	getAllPages: getAllPages,
	getSinglePage: getSinglePage,
	getCurrentPage: getCurrentPage,
	getRevisionPage: getRevisionPage
};
