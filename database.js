// add all your boilerplate code up here
const mongoose = require("mongoose");

// connect mongoose to a database called testdb
mongoose.connect("mongodb://localhost:27017/labDB", 
                {useNewUrlParser: true, 
                 useUnifiedTopology: true});

// because mongoose functions are asynchronous, there is
// no guarantee they will finish in order. To force this,
// we will call them in an async function using the "await"
// keyword after each database read / write

async function databaseCalls () {
    // create a user schema - like a document temlpate
    const userSchema = new mongoose.Schema ({
        username: String,
        password: String
    })

    // create a collection of users using the userSchema
    // using vague rules, mongoose will create the collection "users"
    const User = mongoose.model("User", userSchema);

    // create a new user in the user collection
    const user = new User ({
        username: "123@123.123",
        password: "123"
    });

    // save your record - comment me out if you don't want multiple saves!
    await user.save()
}

databaseCalls()