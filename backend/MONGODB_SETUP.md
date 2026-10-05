# Bookverse MongoDB setup

The backend now uses Mongoose for the books, users, orders, reviews, and shoppingStates MongoDB collections. On its first successful connection to a database, it imports each available legacy JSON collection only if the MongoDB collection is empty. The JSON files remain as backups and are not updated after import.

## Configure MongoDB

1. Create a MongoDB database, for example with MongoDB Atlas, and create a database user.
2. In Atlas, allow your computer's IP address in Network Access.
3. Copy the driver's connection string and replace its username, password, and database name as needed. Example format:

   mongodb+srv://<username>:<password>@<cluster-host>/bookverse?retryWrites=true&w=majority

4. Open backend/.env and add:

   MONGODB_URI=your-connection-string

   Keep your existing environment variables. Do not commit .env or share the connection string.
5. From the backend directory, start the API with npm run dev. The API waits for MongoDB before listening on port 5001.

For local MongoDB, the URI can be:

MONGODB_URI=mongodb://127.0.0.1:27017/bookverse

## Collections

- books: catalog records and inventory.
- users: names, emails, roles, and bcrypt-hashed passwords.
- orders: user-owned orders, line items, INR amount, payment status and payment IDs.
- reviews: book/user IDs, rating, comment and timestamps.
- shoppingStates: each signed-in user's cart and wishlist, separated by user ID.

Signed-in carts and wishlists are stored in MongoDB. Guests' wishlists can remain in browser localStorage. Toast notifications are temporary UI messages; recommendations and dashboard totals are calculated from existing app data. Razorpay secrets stay in backend/.env, not MongoDB.

Older JSON orders without a userId cannot be shown in a particular user's order history. New payment orders are saved with the signed-in user's ID.

The initial migration is marked in the bookverse_migrations collection. To intentionally retry a JSON import later, remove that marker only after backing up the database; collections are imported only when empty.
