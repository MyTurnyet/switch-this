// Collection constants
const DB_COLLECTIONS = {
  ROLLING_STOCK: 'rolling-stock',
  INDUSTRIES: 'industries',
  LOCATIONS: 'locations',
  TRAIN_ROUTES: 'trainRoutes',
  LAYOUT_STATE: 'layoutState',
  SWITCHLISTS: 'switchlists'
};

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
if (!db.getCollectionNames().includes(DB_COLLECTIONS.ROLLING_STOCK)) {
  db.createCollection(DB_COLLECTIONS.ROLLING_STOCK);
}
if (!db.getCollectionNames().includes(DB_COLLECTIONS.LOCATIONS)) {
  db.createCollection(DB_COLLECTIONS.LOCATIONS);
}
if (!db.getCollectionNames().includes(DB_COLLECTIONS.INDUSTRIES)) {
  db.createCollection(DB_COLLECTIONS.INDUSTRIES);
}
if (!db.getCollectionNames().includes(DB_COLLECTIONS.TRAIN_ROUTES)) {
  db.createCollection(DB_COLLECTIONS.TRAIN_ROUTES);
}
if (!db.getCollectionNames().includes(DB_COLLECTIONS.LAYOUT_STATE)) {
  db.createCollection(DB_COLLECTIONS.LAYOUT_STATE);
}
if (!db.getCollectionNames().includes(DB_COLLECTIONS.SWITCHLISTS)) {
  db.createCollection(DB_COLLECTIONS.SWITCHLISTS);
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