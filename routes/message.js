var express = require("express");
var router = express.Router();
var Bible = require("../models/bible");

//INDEX SHOW ROUTE
router.get("/", function(req, res){
	Bible.find({}, function(err, allBible){
		if(err){
			console.log(err);
		} else {
			res.render("member", {bibles:allBible});
		}
	});
});

//CREATE ROUTE
router.post("/", isLoggedIn, function(req, res){
	var header = req.body.header;
	var body = req.body.body;
	var imageUrl = req.body.imageUrl;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newMessage = {header: header, body: body, imageUrl: imageUrl, author: author}
	
	Bible.create(newMessage, function(err, newlyMade){
		if(err){
			console.log(err);
		} else {
			console.log(newlyMade);
			res.redirect("/messages")
		}
	});
});

//FORM TO CREATE NEW MESSAGE
router.get("/new", isLoggedIn, function(req, res){
	res.render("newmessage");
});

//SHOW INDIVIDUAL MESSAGE
router.get("/:id", function(req, res){
	Bible.findById(req.params.id).exec(function(err, foundMessage){
		if(err){
			console.log(err);
		} else {
			console.log(foundMessage)
			res.render("showmessage", {message: foundMessage})
		}
	});
});

//EDIT INDIVIDUAL MESSAGE
router.get("/:id/edit", ownsContent, function(req, res){
	Bible.findById(req.params.id, function(err, foundMessage){
		res.render("editmessage", {message: foundMessage});
	});
});

//UPDATE INDVIDUAL MESSAGE
router.put("/:id", ownsContent, function(req, res){
	Bible.findByIdAndUpdate(req.params.id, req.body.message, function(err, updateMessage){
		if(err){
			res.redirect("/messages");
		} else {
			res.redirect("/messages/" + req.params.id);
		}
	});
});

//DESTROYING INDIVIDUAL MESSAGE
router.delete("/:id", ownsContent, function(req, res){
	Bible.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/messages");
		} else {
			res.redirect("/messages");
		}
	});
});

//MIDDLEWARE
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

function ownsContent(req, res, next) {
	if(req.isAuthenticated()){
		Bible.findById(req.params.id, function(err, foundMessage){
			if(err){
				req.flash("error", "Not found");
				res.redirect("back");
			} else {
				if(foundMessage.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "Permission denied for action");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You must be logged in for that");
		res.redirect("back");
	}
}

module.exports = router;