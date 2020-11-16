// other requires
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { runInNewContext } = require("vm");
const mongoose = require("mongoose");

const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
//mongoose

mongoose.connect("mongodb://localhost:27017/labDB", 
                {useNewUrlParser: true, 
                 useUnifiedTopology: true});
// app.use statements
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

const registerKey = "123456"; // secure!

app.listen(3000, function () {
    console.log("Server started on port 3000");
})


//JSON STUFF ***********************************************************************************************

function User(username, password) {
    this.username = username;
    this.password = password;
}


function saveToJson (fileName, obj) {
    //MODIFY ThIS TO SAVE TO THE DB
    fs.writeFileSync(fileName, JSON.stringify(obj), "utf8",  function(err) {
        if (err) return console.log(err);
    });
}

function loadFromJSON (fileName) {
    //MODIFY THIS TO LOAD FROM DB
    let fileContents = fs.readFileSync(fileName, "utf8", function(err) {
        if (err) return console.log(err);
    });
    let fileObject = JSON.parse(fileContents);
    return fileObject;
}

// initializeUsers(userList);
// saveToJson (__dirname + "/users.json", userList);
// initializeTasks(taskList);
// saveToJson (__dirname + "/tasks.json", taskList);

userList = loadFromJSON (__dirname + "/users.json"); //MODIFY THESE TO LOAD FROM DB
taskList = loadFromJSON (__dirname + "/tasks.json");

//console.log(userList)
//console.log(taskList)

function loadUsers() {
    userList = loadFromJSON (__dirname + "/users.json");
}
function saveUsers() {
    saveToJson (__dirname + "/users.json", userList);
}
function loadTasks() {
    taskList = loadFromJSON (__dirname + "/tasks.json");
}
function saveTasks() {
    saveToJson (__dirname + "/tasks.json", taskList);
}



app.get("/", function (req, res) {
    res.render("index", { test: "Prototype" });
});

app.post("/register", function (req, res) {
    console.log("tried registering");
    if (req.body.authentication === registerKey) {
        console.log("registration key successful");
        loadUsers();
        userList.push(new User(req.body.username, 
                               req.body.password));
        saveUsers();
        res.redirect(307, "/todo");
    } else {
        res.redirect("/");
    }
});

app.post("/login", function (req, res) {
    loadUsers();
    let loggedIn = false;
    for (user of userList){    
        if (user.username === req.body.username &&
            user.password === req.body.password) {
            loggedIn = true;
            console.log("Logged in");
            res.redirect(307, "/todo");
        }
    }
    if (loggedIn === false) {
        res.redirect("/");
    }
});

app.post("/todo", function (req, res) {
    loadTasks();
    res.render("todo", {
        test: "Prototype",
        username: req.body.username,
        items: taskList
    });
})

app.get("/logout", function (req, res) {
    res.redirect("/");
});

app.post("/addtask", function (req, res) {
    for (user of userList){
        if (user.username === req.body.username) {
            taskList.push(new Task(taskList.length,
                                   req.body.newTask,
                                   undefined,
                                   user,
                                   false,
                                   false));
            saveTasks();
            res.redirect(307, "/todo");
        }
    }
});

app.post("/claim", function (req, res) {
    console.log(req.body);
    for (user of userList){
        if (user.username === req.body.username) {
            for (task of taskList) {
                if(task._id === parseInt(req.body.taskId)) {
                    task.owner = user;
                    saveTasks();
                    res.redirect(307, "/todo");
                }
            }
        }
    }
})

app.post("/abandonorcomplete", function (req, res) {
    if (req.body.checked === "on") {
        for (task of taskList) {
            if(task._id === parseInt(req.body.taskId)) {
                task.done = true;
                saveTasks();
                res.redirect(307, "/todo");
            }
        }
    } else {
        // you are "user"
        for (task of taskList) {
            if(task._id === parseInt(req.body.taskId)) {
                task.owner = undefined;
                saveTasks();
                res.redirect(307, "/todo");
            }
        }
    }
});

app.post("/unfinish", function (req, res) {
    for (task of taskList) {
        if(task._id === parseInt(req.body.taskId)) {
            task.done = false;
            saveTasks();
            res.redirect(307, "/todo");
        }
    }
});

app.post("/purge", function (req, res) {
    for (task of taskList) {
        if(task.done === true) {
            task.cleared = true;
        }
    }
    saveTasks();
    res.redirect(307, "/todo");
});