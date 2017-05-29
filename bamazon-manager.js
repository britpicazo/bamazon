var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    start();
});

// List for manager to pick from
var start = function(){
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
            message: "What would you like to do?"
        }
    ]).then(function(answer){
        if(answer.choice === "View Products for Sale"){
            viewProducts();
        }
        else if(answer.choice === "View Low Inventory"){
            lowInventory();
        }
        else if(answer.choice === "Add to Inventory"){
            addToInventory();
        }
        else if(answer.choice === "Add New Product"){
            addNewProduct();
        }
    });
}

var viewProducts = function(){
    connection.query("SELECT * FROM products", function(err, results){
        if (err) throw err;
        console.log("----------------------------------");
        for (var i = 0; i < results.length; i++) {
            console.log("| " + results[i].item_id + " | " + results[i].product_name + " | " + results[i].price + " |");
        }
        console.log("----------------------------------");
    });
}

var lowInventory = function(){
    connection.query("SELECT * FROM products", function(err, results){
        if (err) throw err;
        console.log("----------------------------------");
        for (var i = 0; i < results.length; i++) {
            if(results[i].stock_quantity < 5){
                console.log("| " + results[i].item_id + " | " + results[i].product_name + " | ");
            }
        }
        console.log("----------------------------------");
    });

}

var addToInventory = function(){
    connection.query("SELECT * FROM products", function(err, results){
        inquirer.prompt([
            {
                type: "list",
                name: "choice",
                choices: function(){
                    var choiceArray = [];
                    for(var i = 0; i < results.length; i++){
                        choiceArray.push(results[i].product_name);
                    }
                    return choiceArray;
                },
                message: "Which item would you like to add to?"
            },
            {
                type: "input",
                name: "quantity",
                message: "How many would you like to add?"
            }
        ]).then(function(answer){
            // Grabbing item info from customer choice
            var chosenItem;
            for (var i = 0; i < results.length; i++) {
                if (results[i].product_name === answer.choice){
                    chosenItem = results[i];
                }
            }
            var newAmt = chosenItem.stock_quantity + parseInt(answer.quantity);

            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newAmt
            }, {
                item_id: chosenItem.item_id
            }], function(error) {
                if (error) throw err;
                console.log("Your item was updated");
            });
        })
    });
}

var addNewProduct = function(){
    inquirer.prompt([
        {
            type: "input",
            name: "product",
            message: "What is the name of the product?"
        },
        {
            type: "input",
            name: "dept",
            message: "In what department is the item?"
        },
        {
            type: "input",
            name: "price",
            message: "What is the price of the item?"
        },
        {
            type: "input",
            name: "quantity",
            message: "How many of the item are you adding?"
        }
    ]).then(function(answer){
        connection.query("INSERT INTO products SET ?", {
            product_name: answer.product,
            department_name: answer.dept,
            price: answer.price,
            stock_quantity: answer.quantity
        }, function(err, res){
            if (err) throw err;
            console.log("Your item was added!");
        });
    })
}