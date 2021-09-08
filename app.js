const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

// console.log(date); This will only log the function name
// console.log(date()); This will run the function and show the output

const app = express();

// const items = ["Buy Food", "Cook Food", "Eat Food"]; //Global Variable
// const workItems = [];

app.set("view engine", "ejs");

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(express.static("public"));

// CONNECTING WITH MONGODB(MONGOOSE)

//NOTE:-> If you are getting depication warning use {useNewUrlParser: true} inthe below code
mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true,
});

// Creating mongoose schema
const itemsSchema = {
    name: String,
};

// Creating mongoose model
const Item = mongoose.model("Item", itemsSchema);

// Creating mongoose document
const item1 = new Item({
    name: "Welcome to your To-Do-List!!",
});

const item2 = new Item({
    name: "Hit the + button to add a new item.",
});

const item3 = new Item({
    name: "<-- Hit this to delete an item.",
});

// Adding the items into an array
const defaultItems = [item1, item2, item3];

// Creating new schema
const listSchema = {
    name: String,
    items: [itemsSchema],
};

// Creating new mongoose model
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    // Accessing the module from date.js file which we have created and required

    // let day = date.getDay(); // This will only display the day
    // const day = date.getDate(); // This will display both day and date

    // res.render("list", {
    //     listTitle: day,
    //     newListItems: items
    // });

    // RENDERING DATABASE ITEMS(MONGOOSE)

    // Finding items in  mongoose
    Item.find({}, function (err, foundItems) {
        // This condition is made to avoid the addition of same data multiple times in our database
        if (foundItems.length == 0) {
            // Inserting items to mongoose database
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default items to the database");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems,
            });
        }
    });
});

// CREATING CUSTOM LISTS USING EXPRESS ROUTE PARAMETERS

app.get("/:customListName", function (req, res) {
    // console.log(req.params.customListName);
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({
            name: customListName,
        },
        function (err, foundList) {
            if (!err) {
                if (!foundList) {
                    // console.log("Doesn't exist!!");
                    // Create a new list, Creating new mongoose document
                    const list = new List({
                        name: customListName,
                        items: defaultItems,
                    });

                    list.save();
                    res.redirect("/" + customListName);
                } else {
                    // console.log("Exists!!");
                    // Show an existing list
                    res.render("list", {
                        listTitle: foundList.name,
                        newListItems: foundList.items,
                    });
                }
            }
        }
    );
});

app.post("/", function (req, res) {
    // console.log(req.body);

    // const item = req.body.newItem;
    // if (req.body.list === "Work") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item);
    //     res.redirect("/");
    // }

    const itemName = req.body.newItem;
    const listName = req.body.list;

    // Creating mongoose document
    const item = new Item({
        name: itemName,
    });

    if (listName === "Today") {
        // This will save our item into our collection of Item
        item.save();

        //This will help to display our new added item in the website
        res.redirect("/");
    } else {
        List.findOne({
                name: listName,
            },
            function (err, foundList) {
                foundList.items.push(item); // the embeded array is in listSchema
                foundList.save();
                res.redirect("/" + listName);
            }
        );
    }
});

// For deleting items from our To-Do-List
app.post("/delete", function (req, res) {
    // console.log(req.body.checkbox);

    const checkedItemId = req.body.checkbox;
    // console.log(checkedItemId);

    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                // console.log("Deleted Item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItemId
                }
            }
        }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }

});

// app.get("/work", function (req, res) {

//     res.render("list", {
//         listTitle: "Work List",
//         newListItems: workItems
//     });

// });

// app.post("/work", function (req, res) {

//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// });

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server is running on port 3000.");
});