"use strict";

const express = require("express");
const mysql = require('mysql');
const morgan = require("morgan");
const mongoose = require("mongoose")

const {PostSchema} = require('./models/post.model.js')
const {Comment} = require('./models/comment.model.js')
const {Rating} = require('./models/rating.model.js')
const Post = mongoose.model("Post", PostSchema)

const postHandlers = require("./Post.js")

const addr = process.env.ADDR || ":4000";
const [host, port] = addr.split(":");

const app = express();
//add JSON request body parsing middleware
app.use(express.json());
//add the request logging middleware
app.use(morgan("dev"));

// const mongoEndpoint = "mongodb+srv://plantBuddy:weArePlantBuddy@plantbuddydb.iabth.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const connect = () => {
	mongoose.connect(process.env.MONGO_ENDPT, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
}

// DB ADDR
let db_host = process.env.MYSQL_ADDR
if (!db_host) {
	throw "Missing env variable: MYSQL_ADDR";
}

// DB Pass
let db_pass = process.env.MYSQL_PASS
if (!db_pass) {
	throw "Missing env variable: MYSQL_PASS";
}

// DB Database
let db = process.env.MYSQL_DB
if (!db) {
	throw "Missing env variable: MYSQL_DB";
}

//DELETE!!!!!!!!
//console.log(`Addr: ${db_host}\nPass: ${db_pass}\nDB: ${db}`)

// establish connection
const user_db = mysql.createConnection({host: db_host, user: "root", password: db_pass, port: 3306, database: db});

user_db.connect(function(err) {
	if (err) {
		throw err;
	}
	console.log("Connected to MySQL!");
});

// Test connection
let db_name = process.env.MYSQL_DB;
if (!db_name) {
	throw "Missing database name"
}
let use_stmt = "USE " + db_name;
user_db.query(use_stmt, (err, result) => {
	if (err) {
		throw err;
	}
	console.log("using database " + db_name);
});

const RequestWrapper = (handler, SchemeAndDBForwarder) => {
	return(req, res) => {
		handler(req, res, SchemeAndDBForwarder)
	}
}

// authenticate x-user from the request
app.use((req, res, next) => {
	if (!req.get("X-user")) {
		res.status(401).send("Unauthorized")
		return
	}
	next();
})

app.use((err, req, res, next) => {
	console.error(err) // log the err to the console (serverside only)

	res.set("Content-Type", "text/plain")
	res.status(500).send("Server experienced an error")
})

// handler wrappers
app.get('/posts/plant/token', RequestWrapper(postHandlers.getPlantToken, {}));
app.get('/posts/plant/:plantID', RequestWrapper(postHandlers.getPostsHandler, {Post}))
app.get('/posts/:postID', RequestWrapper(postHandlers.getSpecificPostsHandler, {Post}))
app.get('/posts', RequestWrapper(postHandlers.getPostsHandler, {Post}))

app.patch('/posts/comment/:commentID', RequestWrapper(postHandlers.patchSpecificCommentHandler, {Comment}))
app.patch('/posts/:postID', RequestWrapper(postHandlers.patchSpecificPostsHandler, {Post}))

app.delete('/posts/comment/:commentID', RequestWrapper(postHandlers.deleteSpecificCommentHandler, {Comment}))
app.delete('/posts/:postID', RequestWrapper(postHandlers.deleteSpecificPostsHandler, {Post}))

app.post('/posts/:postID/comment', RequestWrapper(postHandlers.postSpecificCommentHandler, {Post, Comment}))
app.post('/posts', RequestWrapper(postHandlers.postPostsHandler, {Post}))
// connect database
connect();
mongoose.connection.on('error', console.error).on('disconnected', function() {
	console.log("disconnected from mongo")
	connect()
}).once('open', main)

//start the server listening on host:port
async function main() {
	app.listen(port, "", () => {
		//callback is executed once server is listening
		console.log(`server is listening at http://${port}...`)
	})
}
