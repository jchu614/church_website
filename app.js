var bodyParser 	   = require("body-parser"),
	passport 	   = require("passport"),
	LocalStrategy  = require("passport-local"),
	methodOverride = require("method-override"),
	express	   	   = require("express"),
	mongoose  	   = require("mongoose"),
	Bible		   = require("./models/bible"),
	User 		   = require("./models/user"),
	flash 		   = require("connect-flash"),
	app		       = express();
	
	
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


// 	REQUIRED ROUTES
var messageRoutes = require("./routes/message")


// ===========================
// 		PASSPORT CONFIGURATION
// ===========================

app.use(require("express-session")({
	secret: "The secret ingredient to making great bbq is love",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


// ===========================
// 		NON-MEMBER ROUTES
// ===========================

app.get("/", function(req, res){
	if(!res.locals.currentUser) {
		res.render("index");
	} else {
		res.redirect("/messages")
	}
});

app.get("/ministries", function(req, res){
	res.render("ministries");
});

app.get("/about", function(req, res){
	res.render("about");
});

app.get("/resources", function(req, res){
	res.render("resources");
});

app.get("/visit", function(req, res){
	res.render("visit");
});

app.get("/give", function(req, res){
	res.send("GIVE ME YOUR MUNNY FOR BLACKJACK AND HOOKERS");
})


// ===========================
// 		MEMBER ROUTES
// ===========================

//show member log in 
app.get("/login", function(req, res){
	res.render("login");
});

//handle member log in logic
app.post("/login", passport.authenticate("local",
	{
		successRedirect: "/",
		failureRedirect: "/login"
	}), function(req, res){
	
});

//logging out 
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

//show new user register
app.get("/register", function(req, res){
	res.render("register");
});

//handle new user register logic 
app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username, email: req.body.email});
	if(req.body.adminCode === "testadmin123") {
		newUser.isAdmin = true;
	};
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/");
		});
	});
});

app.use("/messages", messageRoutes);



app.listen(process.env.PORT, process.env.IP, function(){
	console.log("Server listening...");
})