# Admin Module

Self-contained admin backend that reuses the existing models, Firebase config,
JWT utility, and `protect` middleware. Does **not** touch the customer app.

## Mount in `server.js`

Add these two lines to the existing `server.js` (no other changes required):

```js
const adminRoutes = require('./admin');
app.use('/api/admin', adminRoutes);
```

## Endpoints

All admin endpoints require `Authorization: Bearer <jwt>` from a user with `role = "admin"`.

| Method | Path                                      | Purpose                          |
|-------:|-------------------------------------------|----------------------------------|
| POST   | /api/admin/auth/login                     | Firebase ID token → admin JWT    |
| GET    | /api/admin/auth/me                        | Current admin                    |
| GET    | /api/admin/dashboard/summary              | KPIs + recent activity           |
| GET    | /api/admin/subscriptions                  | List w/ search, month, paging    |
| GET    | /api/admin/subscriptions/export/csv,pdf   | Exports                          |
| GET    | /api/admin/tomorrow?date=YYYY-MM-DD       | Backend-computed deliveries      |
| GET    | /api/admin/tomorrow/export/csv,pdf        | Exports                          |
| GET    | /api/admin/orders                         | Reprices subtotal from DB        |
| GET    | /api/admin/orders/export/csv,pdf          | Exports                          |
| GET    | /api/admin/products                       | List products                    |
| PUT    | /api/admin/products/:id                   | Edit name/price/category/desc/availability |
| PATCH  | /api/admin/products/:id/toggle            | Enable/disable                   |
| GET    | /api/admin/customers                      | Customers + counts               |
| GET    | /api/admin/customers/:id                  | Customer detail                  |

## Promote a user to admin (one-time, in mongo shell)

```
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```
