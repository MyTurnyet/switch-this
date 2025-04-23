#!/bin/bash

# Wait for MongoDB to be ready
sleep 5

# Import locations data
mongoimport --db switch-this --collection locations --file /src/data/locations.json --jsonArray --username admin --password password --authenticationDatabase admin

# Import industries data
mongoimport --db switch-this --collection industries --file /src/data/industries.json --jsonArray --username admin --password password --authenticationDatabase admin

# Import rolling stock data
mongoimport --db switch-this --collection "rolling-stock" --file /src/data/rolling-stock.json --jsonArray --username admin --password password --authenticationDatabase admin 