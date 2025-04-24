import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'switch-this';

let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export const db = {
  async collection(name: string) {
    const client = await getClient();
    return client.db(dbName).collection(name);
  }
}; 