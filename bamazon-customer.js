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
    if (err) 
        throw err;
    console.log("connected");

    viewTable();
    customerOrder();
});

var viewTable = function(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        console.log("----------------------------------");
        for (var i = 0; i < res.length; i++) {
            console.log("| " + res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " |");
        }
        console.log("----------------------------------");
    });
}

var customerOrder = function(){
    connection.query("SELECT * FROM products", function(err, results){
        if (err) throw err;
        inquirer.prompt([
        {
            type: "input",
            name: "choice",
            choices: function() {
                var choiceArray = [];
                for (var i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].item_id);
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
            var chosenItem;
            for (var i = 0; i < results.length; i++) {
                if (results[i].item_id === answer.choice) {
                    chosenItem = results[i];
                }
            }

            if (choseItem.stock_quantity >= parseInt(answer.quantity)) {
                
                // Enough in stock, so update db and let the user know
                connection.query("UPDATE products SET ? WHERE ?", [{
                    stock_quantity: stock_quantity - answer.quantity
                    }, {
                    id: chosenItem.item_id
                }], function(error) {
                    if (error) throw err;
                    console.log("Your order was placed!");
                });
            }
            else {
                // Not enough in stock
                console.log("Sorry - insufficient quantity of your item. Try again!");
                start();
            }
        });
    })
}