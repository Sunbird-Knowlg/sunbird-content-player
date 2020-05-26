/*
 * Copyright (c) 2013-2014 Canopus Consulting. All rights reserved.
 *
 * This code is intellectual property of Canopus Consulting. The intellectual and technical
 * concepts contained herein may be covered by patents, patents in process, and are protected
 * by trade secret or copyright law. Any unauthorized use of this code without prior approval
 * from Canopus Consulting is prohibited.
 */

/**
 * Bootstrap for the Orchestrator
 *
 * @author Santhosh
 */
appConfig = require("./app-data/appConfig.json")
var express = require("express")
var http = require("http")
var path = require("path")
// var favicon = require('serve-favicon')
var morgan = require('morgan')
var compression = require('compression')
var methodOverride = require('method-override')
var cookieParser = require('cookie-parser')
var serveStatic = require('serve-static')
var errorhandler = require('errorhandler')
var bodyParser = require('body-parser')
var fs = require("fs")

http.globalAgent.maxSockets = 100000

var app = express()

// all environments
app.set("port", 3000)
// eslint-disable-next-line
app.set("views", __dirname + "/views")
app.set("view engine", "ejs")
//app.use(express.favicon())
// app.use(favicon())
// app.use(express.logger("dev"))
app.use(morgan('dev'));
// app.use(express.compress())
app.use(compression())
app.use(express.json())

// app.use(express.urlencoded())
app.use(bodyParser.urlencoded({
    extended: true
}));
// app.use(express.bodyParser())
app.use(bodyParser.json())
// app.use(express.methodOverride())
app.use(methodOverride())
// app.use(express.cookieParser())
app.use(cookieParser())


// app.use(app.router)
app.locals = {
    contextPath: ""
}

// app.use(express.compress())
// app.use(express.static(path.join(__dirname, "public")))
app.use(serveStatic(path.join(__dirname, "public")))
// app.use(express.static(path.join(__dirname, "../js-libs/")))
app.use(serveStatic(path.join(__dirname, "../js-libs/")))
// app.use(express.static(path.join(__dirname, "../player/node_modules/")))
app.use(serveStatic(path.join(__dirname, "../player/node_modules/")))
// app.use(express.static(path.join(__dirname, "views")))
app.use(serveStatic(path.join(__dirname, "views")))

// development only
if (app.get("env") === "development") {
    app.use(errorhandler())
}

// Bootstrap routes
// eslint-disable-next-line
var routes = __dirname + "/server/routes";
var route_files = fs.readdirSync(routes)
route_files.forEach(function(file) {
    require(routes + "/" + file)(app, __dirname)
})

// Workers can share any TCP connection
// In this case its a HTTP server
var server = http.createServer(app).listen(app.get("port"), 1500)
server.timeout = 0