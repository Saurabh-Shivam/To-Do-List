const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

// console.log(date); This will only log the function name
// console.log(date()); This will run the function and show the output

const app = express();

const items = ["Buy Food", "Cook Food", "Eat Food"]; //Global Variable
const workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

app.get("/", function (req, res) {

    // Accessing the module from date.js file which we have created and required

    // let day = date.getDay(); // This will only display the day
    const day = date.getDate(); // This will display both day and date

    res.render("list", {
        listTitle: day,
        newListItems: items
    });
});

app.post("/", function (req, res) {
    // console.log(req.body);

    const item = req.body.newItem;

    if (req.body.list === "Work") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }

});

app.get("/work", function (req, res) {

    res.render("list", {
        listTitle: "Work List",
        newListItems: workItems
    });

});

app.post("/work", function (req, res) {

    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about", function (req, res) {

    res.render("about");

});

app.listen(3000, function () {
    console.log("Server is running on port 3000.");
});