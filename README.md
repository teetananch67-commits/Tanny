# Single Restaurant Ordering System

Full-stack single-restaurant ordering system with two roles:
- CUSTOMER
- MERCHANT_ADMIN

## Tech Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind
- Backend: Node.js + Express + TypeScript
- DB: MySQL + Prisma
- Auth: JWT + HttpOnly cookie (access + refresh)

## Project Structure
- `backend` Express API
- `frontend` Next.js App

## Setup

### 1) Database
Create a MySQL database (example: `pos_res`).

### 2) Backend
```
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```
API runs on `http://localhost:4000`.

### 3) Frontend
```
cd frontend
cp .env.example .env
npm install
npm run dev
```
Web runs on `http://localhost:3000`.

## Test Accounts
- Customer: `customer1@test.com` / `password`
- Merchant: `merchant@test.com` / `password`

## New Features
- Saved addresses with default selection (customer checkout).
- Promotions banner carousel (merchant can manage).
- Payment methods: QR with slip upload, or cash (toggle in merchant settings).

## API Examples

### 1) Create order (PENDING_PAYMENT)
Request:
```
POST /api/orders
Content-Type: application/json
Cookie: access_token=...

{
  "items": [
    { "menuItemId": 1, "qty": 2 },
    { "menuItemId": 3, "qty": 1 }
  ],
  "addressId": 1,
  "address": { "line1": "123 Main St", "note": "No onions" }
}
```
Response:
```
{
  "id": 12,
  "orderNo": "ORD-20260130-AB12CD",
  "status": "PENDING_PAYMENT",
  "subtotal": "190.00",
  "deliveryFee": "0.00",
  "total": "190.00",
  "items": [
    { "id": 55, "menuItemId": 1, "nameSnapshot": "Chicken Rice", "qty": 2, "total": "120.00" },
    { "id": 56, "menuItemId": 3, "nameSnapshot": "Tom Yum Noodles", "qty": 1, "total": "70.00" }
  ]
}
```

### 2) Payment success (Mock)
Request:
```
POST /api/payments
Content-Type: application/json
Cookie: access_token=...

{ "orderId": 12, "method": "QR_CODE", "slipImageUrl": "data:image/png;base64,..." }
```
Response:
```
{
  "payment": {
    "id": 8,
    "orderId": 12,
    "method": "QR_CODE",
    "amount": "190.00",
    "status": "SUCCESS",
    "paidAt": "2026-01-30T01:22:00.000Z",
    "refCode": "QR_CODE-1738219320000",
    "slipImageUrl": "data:image/png;base64,..."
  },
  "order": {
    "id": 12,
    "status": "PAID"
  }
}
```

### 3) Merchant confirm + update status
Confirm:
```
POST /api/merchant/orders/12/confirm
Cookie: access_token=...
```
Update status to COOKING:
```
POST /api/merchant/orders/12/status
Content-Type: application/json
Cookie: access_token=...

{ "status": "COOKING" }
```
Response:
```
{ "id": 12, "status": "COOKING" }
```

### 4) Get order detail (timeline)
Request:
```
GET /api/orders/12
Cookie: access_token=...
```
Response:
```
{
  "id": 12,
  "orderNo": "ORD-20260130-AB12CD",
  "status": "COOKING",
  "items": [
    { "id": 55, "nameSnapshot": "Chicken Rice", "qty": 2, "total": "120.00" }
  ],
  "statusLogs": [
    { "id": 1, "status": "PENDING_PAYMENT", "byRole": "CUSTOMER", "createdAt": "2026-01-30T01:20:00.000Z" },
    { "id": 2, "status": "PAID", "byRole": "CUSTOMER", "createdAt": "2026-01-30T01:21:00.000Z" },
    { "id": 3, "status": "CONFIRMED", "byRole": "MERCHANT_ADMIN", "createdAt": "2026-01-30T01:21:30.000Z" },
    { "id": 4, "status": "COOKING", "byRole": "MERCHANT_ADMIN", "createdAt": "2026-01-30T01:22:00.000Z" }
  ]
}
```
