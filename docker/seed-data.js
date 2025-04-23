db = db.getSiblingDB('switch-this');

// Seed locations data
const locations = [
  {
    id: "1",
    name: "Edmonton, AB",
    type: "Yard",
    block: "NORTH",
    capacity: 100,
    currentOccupancy: 50,
    coordinates: { lat: 53.5444, lng: -113.4909 }
  },
  {
    id: "2",
    name: "Seattle, WA",
    type: "Yard",
    block: "SEA",
    capacity: 100,
    currentOccupancy: 50,
    coordinates: { lat: 47.6062, lng: -122.3321 }
  }
];

// Seed rolling stock data
const rollingStock = [
  {
    id: "1",
    carType: "Flatcar BlhHd",
    reportingMark: "GSVR",
    carNumber: "459003",
    aarType: "FB",
    color: "RED",
    status: "Available",
    location: "Edmonton, AB"
  }
];

// Seed industries data
const industries = [
  {
    id: "1",
    name: "Weyerhaeuser",
    industryType: "FREIGHT",
    location: "Seattle, WA",
    tracks: [
      {
        id: "1",
        name: "shipping",
        maxCars: 3,
        placedCars: []
      }
    ]
  }
];

// Insert data
db['locations'].insertMany(locations);
db['rolling-stock'].insertMany(rollingStock);
db['industries'].insertMany(industries);

print('Database seeded successfully!'); 