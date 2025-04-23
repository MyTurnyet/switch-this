db = db.getSiblingDB('switch-this');

// Create collections
db.createCollection('rolling-stock');
db.createCollection('locations');

// Create indexes
db['rolling-stock'].createIndex({ "id": 1 }, { unique: true });
db['locations'].createIndex({ "id": 1 }, { unique: true });

// Create a user for the application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'switch-this'
    }
  ]
}); 