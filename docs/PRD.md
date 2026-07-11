# Product Requirements Document (PRD)

## 1. Product Overview
**Sweetbook** is a modern, premium Business Operating System (BOS) designed specifically for Indian sweet shops (Mithai shops), bakeries, and premium confectioneries. It replaces traditional, generic accounting software with a domain-specific POS (Point of Sale) and CRM tailored for managing sweets, namkeen, fast-moving consumer goods, and VIP customer relationships.

## 2. Target Audience
- Owners and managers of premium sweet boutiques (e.g., Haldiram's, Bikanervala style).
- Cashiers handling high-volume festival sales.

## 3. Core Features

### 3.1 Point of Sale (Billing)
- High-speed billing interface tailored for counter sales.
- Support for weighted items (KG) and unit items (Pieces).
- Real-time customer search by phone number.
- Automatic application of global discounts, item discounts, and dynamic GST calculation.
- Support for multiple payment methods (UPI, CASH, CARD).
- Instant 80mm thermal receipt generation.

### 3.2 Customer Relationship Management (CRM)
- Automated VIP Tiering system based on total spending and visit frequency (Diamond, Platinum, Gold).
- Loyalty point accumulation and redemption.
- Tracking of customer birthdays and anniversaries for targeted marketing.
- Customer purchase history and favorite products.

### 3.3 Inventory & Product Management
- Categorized inventory (Sweets, Namkeen, Bakery, Beverages).
- Low stock alerts (Minimum stock thresholds).
- Pricing and GST configuration per product.

### 3.4 Advance Orders
- Management of bulk festival orders and custom event orders (e.g., weddings, Diwali).
- Tracking of advance amounts paid vs. remaining balances.
- Due date and time tracking.

### 3.5 Marketing & Offers
- Creation of promotional campaigns (percentage or flat discounts).
- VIP-restricted offers (e.g., "Diamond members get 20% off during Diwali").
- Minimum bill value requirements for offers.

### 3.6 Analytics & Reports
- Comprehensive dashboard with "waterfall" animations.
- 7 distinct report types: Sales, Products, Customers, Payments, Inventory, GST, and VIP Analytics.
- Date-range filtering across all metrics (Today, This Week, This Month, Custom).

## 4. User Workflows

### 4.1 The Checkout Flow
1. Cashier enters customer phone number (optional).
2. If new, customer profile is automatically created.
3. Cashier searches/selects products and specifies quantity (e.g., 0.5 KG Kaju Katli).
4. System applies eligible VIP discounts or loyalty points.
5. Cashier selects payment method.
6. Bill is generated, database is updated, and thermal receipt prints.

## 5. Business Rules
- **Loyalty Points**: Earned based on a configurable multiplier per Rupee spent (e.g., 1 point per ₹100).
- **VIP Tiers**: Evaluated on every completed invoice. Thresholds are globally configurable in Settings.
- **Stock Deductions**: Inventory is deducted immediately upon invoice generation.

## 6. Acceptance Criteria
- System must never block the main thread during high-volume sales.
- UI must feel like a premium brand (Warm Ivory, Deep Emerald, Royal Gold).
- No generic CRM aesthetics; empty states and loading states must reflect the sweet shop domain.
