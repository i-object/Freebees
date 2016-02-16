var mongoose = require('mongoose');

//Item is a model (i.e. row) that fits into the db, it has itemName and itemLocation props 
var Item = require('./itemModel.js');

//Q's nbind() method used below to promisify methods, although this will only be helpful for future features
var Q = require('q');

module.exports = {
  saveItem : function (req, res) {

    //extract itemName and itemLocation from the post request's body
    var itemName = req.body.item;
    var itemLocation = req.body.LatLng;

    var create;

    //The below line returns promisified version of Item.findOne bound to context Item
    //This is necessary because we will only create a new model after we search the db to see if it already exists
    var findOne = Q.nbind(Item.findOne, Item);

    //The below line searches the database for a pre-existing row in db that exactly matches the user input
    findOne({itemName: itemName, itemLocation: itemLocation})

      .then(function(item){

        //If the item already exists in db, notify the user they need to try again
        if (item){
          console.log('That item is already being offered from that location \n Try offering something new');
        } else {
          //Otherwise we're going to create and save the user's submitted item

          //Q.nbind() promisifies its first argument, so now you could chain a .then() after create
          //the .then() below could be helpful for future features
          create = Q.nbind(Item.create, Item);
          newItem = {
            itemName: itemName,
            itemLocation: itemLocation
          };

          // In mongoose, .create() automaticaly creates AND saves simultaneously
          create(newItem)
            .then(function(data){
              res.send(data);
            });
        }
    });
  },

  //The below function returns all rows from the db. It is called whenever user visits '/' or '/api/links'
  getAllItems: function(req, res){

    //promisify Item.find so that it can have a .then() chained to it
    var findAll = Q.nbind(Item.find, Item);

    //search db for an empty object, i.e. return everything in the db
    findAll({})
      .then(function(items){

        //sends all the rows in the db, which then get used in initMap function within
        //success callback of loadAllItems in app.js
        res.json(items);
    });
  }
};


