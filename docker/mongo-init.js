// Create root user if it doesn't exist
db = db.getSiblingDB('admin');
if (!db.getUser('admin')) {
  db.createUser({
    user: 'admin',
    pwd: 'password',
    roles: ['root']
  });
}

// Switch to application database
db = db.getSiblingDB('switch-this');

// Create collections if they don't exist
if (!db.getCollectionNames().includes('rolling-stock')) {
  db.createCollection('rolling-stock');
}
if (!db.getCollectionNames().includes('locations')) {
  db.createCollection('locations');
}
if (!db.getCollectionNames().includes('industries')) {
  db.createCollection('industries');
}

// Create application user if it doesn't exist
if (!db.getUser('app_user')) {
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
} 