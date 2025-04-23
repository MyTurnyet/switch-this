db = db.getSiblingDB('switch-this');

// Helper function to convert MongoDB ObjectId to string ID
function convertToId(obj) {
  if (obj && obj.$oid) {
    return obj.$oid;
  }
  return obj;
}

// Helper function to convert number string to number
function convertToNumber(obj) {
  if (obj && obj.$numberInt) {
    return parseInt(obj.$numberInt);
  }
  if (obj && obj.$numberDouble) {
    return parseFloat(obj.$numberDouble);
  }
  return obj;
}

// Load and transform locations data
const locationsData = cat('/src/data/locations.json');
const locations = JSON.parse(locationsData).map(loc => ({
  id: convertToId(loc._id),
  name: loc.stationName,
  type: "Yard", // Default type since not specified in original data
  block: loc.block,
  capacity: 100, // Default capacity
  currentOccupancy: 50, // Default occupancy
  coordinates: { lat: 0, lng: 0 } // Default coordinates, would need to be updated with actual values
}));

// Load and transform rolling stock data
const rollingStockData = cat('/src/data/rolling-stock.json');
const rollingStock = JSON.parse(rollingStockData).map(rs => ({
  id: convertToId(rs._id),
  carType: rs.description,
  reportingMark: rs.roadName,
  carNumber: rs.roadNumber.toString(),
  aarType: rs.aarType,
  color: rs.color,
  status: "Available", // Default status
  location: "Unknown", // Default location, would need to be updated based on homeYard
  note: rs.note || ""
}));

// Load and transform industries data
const industriesData = cat('/src/data/industries.json');
const industries = JSON.parse(industriesData).map(ind => ({
  id: convertToId(ind._id),
  name: ind.name,
  industryType: ind.industryType,
  location: "Unknown", // Would need to be updated based on locationId
  tracks: ind.tracks.map(track => ({
    id: convertToId(track._id),
    name: track.name,
    maxCars: convertToNumber(track.maxCars),
    placedCars: track.placedCars || []
  }))
}));

// Load and transform train routes data
const trainRoutesData = cat('/src/data/train-routes.json');
const trainRoutes = JSON.parse(trainRoutesData).map(route => ({
  id: convertToId(route._id),
  name: route.name,
  origin: convertToId(route.origin),
  destination: convertToId(route.destination),
  stops: route.stops.map(stop => convertToId(stop))
}));

// Clear existing collections
db['locations'].drop();
db['rolling-stock'].drop();
db['industries'].drop();
db['train-routes'].drop();

// Insert all data
db['locations'].insertMany(locations);
db['rolling-stock'].insertMany(rollingStock);
db['industries'].insertMany(industries);
db['train-routes'].insertMany(trainRoutes);

print('All data seeded successfully!');
print(`Locations: ${locations.length} records`);
print(`Rolling Stock: ${rollingStock.length} records`);
print(`Industries: ${industries.length} records`);
print(`Train Routes: ${trainRoutes.length} records`); 