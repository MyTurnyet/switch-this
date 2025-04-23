db = db.getSiblingDB('switch-this');

// Seed rolling stock data
const rollingStock = [
  {
    id: "1",
    carType: "Box Car",
    reportingMark: "BNSF",
    carNumber: "12345",
    length: 50,
    capacity: 100000,
    status: "Available",
    location: "Yard A"
  },
  {
    id: "2",
    carType: "Tank Car",
    reportingMark: "UP",
    carNumber: "67890",
    length: 40,
    capacity: 30000,
    status: "In Use",
    location: "Industry B"
  },
  {
    id: "3",
    carType: "Flat Car",
    reportingMark: "CSX",
    carNumber: "54321",
    length: 60,
    capacity: 150000,
    status: "Available",
    location: "Yard C"
  }
];

// Seed locations data
const locations = [
  {
    id: "1",
    name: "Yard A",
    type: "Yard",
    capacity: 100,
    currentOccupancy: 50,
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: "2",
    name: "Industry B",
    type: "Industry",
    capacity: 20,
    currentOccupancy: 15,
    coordinates: { lat: 41.8781, lng: -87.6298 }
  },
  {
    id: "3",
    name: "Yard C",
    type: "Yard",
    capacity: 80,
    currentOccupancy: 30,
    coordinates: { lat: 34.0522, lng: -118.2437 }
  }
];

// Insert data
db['rolling-stock'].insertMany(rollingStock);
db['locations'].insertMany(locations);

print('Database seeded successfully!'); 