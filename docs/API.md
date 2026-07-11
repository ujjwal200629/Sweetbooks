# API Documentation

The Sweetbook backend exposes RESTful endpoints for POS operations. All requests require a `Bearer <token>` unless otherwise specified.

## Authentication

### `POST /api/auth/login`
Authenticates a user and returns a JWT.
**Payload:**
```json
{
  "email": "demo@sweetbook.com",
  "password": "password123"
}
```
**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI...",
  "user": {
    "id": "uuid",
    "name": "Shop Owner",
    "email": "demo@sweetbook.com",
    "role": "OWNER"
  }
}
```

## Customers

### `GET /api/customers`
Retrieves all customers.

### `GET /api/customers/phone/:phone`
Retrieves a single customer by phone number.

### `POST /api/customers`
Creates a new customer profile.
**Payload:**
```json
{
  "name": "Aarav Sharma",
  "phone": "9876543210"
}
```

## Products

### `GET /api/products`
Retrieves inventory.

### `POST /api/products`
Creates a new product.
**Payload:**
```json
{
  "name": "Kaju Katli",
  "category": "SWEETS",
  "unit": "KG",
  "price": 1000,
  "gst": 5,
  "stock": 10
}
```

## Billing / Invoices

### `POST /api/invoices`
Generates an invoice, deducts stock, and awards loyalty points.
**Payload:**
```json
{
  "customerId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 1, "price": 1000, "gst": 50, "discount": 0, "total": 1050 }
  ],
  "subtotal": 1000,
  "gst": 50,
  "discount": 0,
  "grandTotal": 1050,
  "paymentMethod": "UPI",
  "billingType": "TAKEAWAY"
}
```

## Dashboard & Analytics

### `GET /api/dashboard/stats`
Returns aggregated statistics for the dashboard.
**Query Parameters:**
- `timeRange` (Today | This Week | This Month)

**Response:**
```json
{
  "todayRevenue": 15000,
  "todayOrders": 45,
  "monthlyRevenue": 450000,
  "monthlyOrders": 1200,
  "vipVisitsToday": {
    "DIAMOND": 2,
    "PLATINUM": 5,
    "GOLD": 10
  }
}
```
