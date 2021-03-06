//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/mydb';

var _db;

// // Use connect method to connect to the Server
// MongoClient.connect(url, function (err, db) {
//   if (err) {
//     console.log('Unable to connect to the mongoDB server. Error:', err);
//   } else {
//     //HURRAY!! We are connected. :)
//     console.log('Connection established to', url);

//     // Get the documents collection
//     var collection = db.collection('users');

//     //Create some users
//     var user1 = {name: 'modulus admin', age: 42, roles: ['admin', 'moderator', 'user']};
//     var user2 = {name: 'modulus user', age: 22, roles: ['user']};
//     var user3 = {name: 'modulus super admin', age: 92, roles: ['super-admin', 'admin', 'moderator', 'user']};

//     // Insert some users
//     collection.insert([user1, user2, user3], function (err, result) {
//       if (err) {
//         console.log(err);
//       } else {
//         //console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);
//       }
//      collection.find({name:"modulus admin"}).toArray(function(err, results){
//         console.log(results); // output all records
//      });
//       //Close connection
//       db.close();
//     });
//   }
// });

module.exports = {
  connect: function( callback ) {
    MongoClient.connect( "mongodb://pen.cs.uky.edu:19000/mydb", function( err, db ) {
      _db = db;
      console.log("Connected to database");
    });
  },

  getDb: function() {
    return _db;
  },
  insertEvent:function(event, callback){
        var collection = _db.collection("Events");
        collection.update(event, event, {upsert:true}, function(err, result){
            //console.log(result.result);
            if (err) 
            {
                console.log(err);
                callback(err);
            } 
            else 
            {
                console.log('Event Successfully inserted');
                callback(null);
            }
        });
    },
    showAllEvents:function(callback){
        var collection = _db.collection("Events");
        collection.find().toArray(function(err, results){
            callback(results);
        });
    },
    deleteEvent:function(deleteObj, callback){
        var collection = _db.collection("Events");
        console.log(deleteObj._id)
        collection.deleteOne({ _id: new mongodb.ObjectID(deleteObj._id) }, function(err, result){
            if(err)
            {
                console.log(err);
                callback(err);
            }
            else
            {
                console.log("Event Successfully Deleted");
                callback(null);
            }
        });
    },
    addUserToEvent:function(addObj, callback){
        var collection = _db.collection("GoingTo");
        collection.update(addObj, addObj, {upsert:true}, function(err, result){
            if(err)
            {
                callback(err);
            }
            else
            {
                var inserted;
                if(result.result.nModified == 0)
                {
                    //console.log("UPSERT HAPPENED");
                    inserted = true;
                    callback(inserted);
                }
                else
                {
                    //console.log("UPSERT DIDNT HAPPEN");
                    inserted = false;
                    callback(inserted);
                }
            }
        });
    },
    removeUserFromEvent:function(deleteObj, callback){
        console.log(deleteObj);
        var collection = _db.collection("GoingTo");
        collection.deleteOne({ eventID: deleteObj.eventID, email: deleteObj.email }, function(err, result){
            if(err)
            {
                callback(err);
            }
            else
            {
                console.log("User Successfully Removed From Event");
                callback(null);
            }
        });
    },
    getAllUsersForEvent:function(allUsers, callback){
        var collection = _db.collection("GoingTo");
        collection.find({ eventID: allUsers.eventID }).toArray( function(err, results){
            if(err)
            {
                callback(err);
            }
            else
            {
                console.log("All Users Successfully Returned");
                callback(results);
            }
        });
    },
    getEvent: function(obj, callback){
        var collection = _db.collection("Events");
        collection.find({_id: mongodb.ObjectID(obj.eventID)}).toArray(function(err, results){
            if(err)
            {
                callback(err)
            }
            else
            {
                callback(results);
            }
        });
    },
    getAllEventInfo: function(obj, callback){
        var collection = _db.collection("Events");
        collection.find({_id: mongodb.ObjectID(obj.eventID)}).toArray(function(err, results){
            if(err)
            {
                callback(err)
            }
            else
            {
                callback(results);
            }
        });
    }

};