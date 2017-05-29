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
    console.log("connected");

    viewTable();
    customerOrder();
});

// View everything in table "products"
var viewTable = function(){
    connection.query("SELECT * FROM products", function(err, results){
        if (err) throw err;
        console.log("----------------------------------");
        for (var i = 0; i < results.length; i++) {
            console.log("| " + results[i].item_id + " | " + results[i].product_name + " | " + results[i].price + " |");
        }
        console.log("----------------------------------");
    });
}


var customerOrder = function(){
    connection.query("SELECT * FROM products", function(err, results){
        if (err) throw err;
        // Prompting user for the item_id
        inquirer.prompt([
            {
                type: "list",
                name: "choice",
                choices: function() {
                    // Filling choices from item_id
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].item_id.toString());
                    }
                    return choiceArray;
                },
                message: "What is the ID of the product you would like to buy?"
            },
            {
                type: "input",
                name: "quantity",
                message: "How many would you like?"
            }
        ]).then(function(answer) {
            // Grabbing item info from customer choice
            var chosenItem;
            for (var i = 0; i < results.length; i++) {
                if (parseInt(results[i].item_id) === parseInt(answer.choice)){
                    chosenItem = results[i];
                }
            }

            if (parseInt(chosenItem.stock_quantity) >= parseInt(answer.quantity)) {
                var newAmt = chosenItem.stock_quantity - answer.quantity;
                
                // Enough stock, so update db and let the user know
                connection.query("UPDATE products SET ? WHERE ?", [{
                    stock_quantity: newAmt
                }, {
                    item_id: chosenItem.item_id
                }], function(error) {
                    if (error) throw err;
                    console.log("Your order was placed!");
                });
            }
            else {
                // Not enough in stock
                console.log("Sorry - insufficient quantity of your item. Try again!");
            }
        });
    })
}