# 📱 Restaurant Booking API Specification for Mobile App

## 📋 TỔNG QUAN

Document này mô tả chi tiết API endpoints và business logic để mobile app hoàn thiện chức năng **Đặt bàn nhà hàng**.

**Base URL:** `http://your-domain.com/api/v1`

**Authentication:** 
- Hầu hết endpoints yêu cầu JWT token
- Header: `Authorization: Bearer {token}`

---

## 🎯 USER FLOW CHÍNH

```
1. Xem danh sách nhà hàng
   ↓
2. Chọn nhà hàng → Xem chi tiết (menu, giờ mở cửa, số bàn trống)
   ↓
3. Chọn "Đặt bàn" → Điền form (ngày, giờ, số người)
   ↓
4. Hệ thống check bàn trống tự động
   ↓
5. Xác nhận đặt bàn → Nhận confirmation
   ↓
6. Xem lịch sử đặt bàn trong Profile
   ↓
7. Hủy/Sửa booking (nếu cần)
```

---

## 🔌 API ENDPOINTS

### **1. Lấy danh sách nhà hàng**

```http
GET /restaurants
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Trang hiện tại (default: 1) |
| limit | number | No | Số items/trang (default: 10) |
| propertyId | string (UUID) | No | Filter theo khách sạn |
| cuisineType | string | No | Filter theo loại món ("Vietnamese", "Italian"...) |

**Response:** `200 OK`
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "name": "Golden Dragon Restaurant",
      "description": "Fine dining với không gian sang trọng",
      "cuisineType": "Vietnamese",
      "location": "Tầng 5, Khách sạn XYZ",
      "openingHours": "06:00 - 23:00",
      "rating": 4.5,
      "images": ["url1", "url2"],
      "property": {
        "id": "uuid",
        "name": "Grand Hotel",
        "address": "123 Đường ABC",
        "city": "TP.HCM"
      }
    }
  ],
  "total": 15
}
```

---

### **2. Xem chi tiết nhà hàng**

```http
GET /restaurants/:id
```

**Path Parameters:**
- `id` (UUID): Restaurant ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  "name": "Golden Dragon Restaurant",
  "description": "Fine dining với không gian sang trọng và view thành phố tuyệt đẹp",
  "cuisineType": "Vietnamese Fusion",
  "location": "Tầng 5, Khách sạn Grand Hotel",
  "openingHours": "06:00 - 23:00",
  "rating": 4.5,
  "images": ["url1", "url2", "url3"],
  "property": {
    "id": "uuid",
    "name": "Grand Hotel",
    "address": "123 Đường ABC",
    "city": "TP.HCM",
    "phone": "0123456789",
    "email": "contact@grandhotel.com"
  },
  "tables": [
    {
      "id": "table-uuid-1",
      "tableNumber": "T01",
      "capacity": 4,
      "status": "available",
      "restaurantId": "uuid"
    },
    {
      "id": "table-uuid-2",
      "tableNumber": "T02",
      "capacity": 6,
      "status": "occupied",
      "restaurantId": "uuid"
    }
  ],
  "areas": [
    {
      "id": "area-uuid-1",
      "name": "VIP Area",
      "restaurantId": "uuid"
    }
  ]
}
```

**⚠️ Quan trọng:** Response PHẢI bao gồm array `tables` để mobile app:
- Hiển thị tổng số bàn
- Hiển thị số bàn trống
- Tính capacity min/max

---

### **3. Check bàn trống (Available Tables)**

```http
GET /restaurants/tables/available
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| restaurantId | string (UUID) | **Yes** | Restaurant ID |
| date | string | **Yes** | Ngày đặt bàn (format: `YYYY-MM-DD`) |
| time | string | **Yes** | Giờ đặt bàn (format: `HH:mm`) |
| partySize | number | **Yes** | Số người (1-12) |

**Example Request:**
```http
GET /restaurants/tables/available?restaurantId=abc-123&date=2025-12-25&time=19:00&partySize=4
```

**Response:** `200 OK`
```json
[
  {
    "id": "table-uuid-1",
    "restaurantId": "uuid",
    "tableNumber": "T03",
    "capacity": 4,
    "status": "available",
    "areaId": "area-uuid",
    "area": {
      "id": "area-uuid",
      "name": "Main Dining"
    }
  },
  {
    "id": "table-uuid-2",
    "tableNumber": "T05",
    "capacity": 6,
    "status": "available"
  }
]
```

**Business Logic:**
1. Lọc các bàn có `capacity >= partySize`
2. Loại bỏ bàn đã được book trong cùng `date` + `time`
3. Chỉ trả về bàn có `status = 'available'`

**Error Response:** `200 OK` với empty array `[]` nếu không có bàn

---

### **4. Tạo booking mới**

```http
POST /restaurants/bookings
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "restaurantId": "uuid",
  "bookingDate": "2025-12-25",
  "bookingTime": "19:00",
  "pax": 4,
  "contactName": "Nguyễn Văn A",
  "contactPhone": "0912345678",
  "specialRequests": "Cần ghế em bé và view đẹp",
  "durationMinutes": 120
}
```

**Request Body Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| restaurantId | string (UUID) | **Yes** | Restaurant ID |
| bookingDate | string | **Yes** | Format: `YYYY-MM-DD` |
| bookingTime | string | **Yes** | Format: `HH:mm` (24h) |
| pax | number | **Yes** | Số người (1-12) |
| contactName | string | No | Tên người đặt |
| contactPhone | string | No | SĐT liên hệ |
| specialRequests | string | No | Yêu cầu đặc biệt |
| durationMinutes | number | No | Thời gian dự kiến (default: 90 phút) |
| guestId | string (UUID) | No | Guest ID (nếu có) |
| assignedTableId | string (UUID) | No | Table ID (tự động chọn nếu không có) |

**Response:** `201 Created`
```json
{
  "id": "booking-uuid",
  "restaurantId": "uuid",
  "guestId": "uuid",
  "bookingDate": "2025-12-25T00:00:00.000Z",
  "bookingTime": "19:00",
  "pax": 4,
  "status": "pending",
  "assignedTableId": null,
  "specialRequests": "Cần ghế em bé và view đẹp",
  "durationMinutes": 120,
  "createdAt": "2025-12-24T10:30:00.000Z",
  "restaurant": {
    "id": "uuid",
    "name": "Golden Dragon Restaurant",
    "location": "Tầng 5",
    "phone": "0123456789"
  }
}
```

**Error Responses:**

`400 Bad Request` - Validation error
```json
{
  "statusCode": 400,
  "message": "Validation failed: pax must be between 1 and 12",
  "error": "Bad Request"
}
```

`404 Not Found` - Restaurant không tồn tại
```json
{
  "statusCode": 404,
  "message": "Restaurant not found",
  "error": "Not Found"
}
```

---

### **5. Lấy danh sách booking của user**

```http
GET /restaurants/bookings
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Default: 1 |
| limit | number | No | Default: 10 |
| status | string | No | `pending`, `confirmed`, `seated`, `completed`, `cancelled`, `no_show` |
| date | string | No | Filter theo ngày (YYYY-MM-DD) |
| restaurantId | string (UUID) | No | Filter theo nhà hàng |

**Example:**
```http
GET /restaurants/bookings?page=1&limit=20&status=confirmed
```

**Response:** `200 OK`
```json
{
  "bookings": [
    {
      "id": "booking-uuid",
      "restaurantId": "uuid",
      "bookingDate": "2025-12-25T00:00:00.000Z",
      "bookingTime": "19:00",
      "pax": 4,
      "status": "confirmed",
      "assignedTableId": "table-uuid",
      "specialRequests": "View đẹp",
      "durationMinutes": 120,
      "createdAt": "2025-12-20T08:00:00.000Z",
      "restaurant": {
        "id": "uuid",
        "name": "Golden Dragon Restaurant",
        "cuisineType": "Vietnamese",
        "location": "Tầng 5"
      },
      "assignedTable": {
        "id": "table-uuid",
        "tableNumber": "T05",
        "capacity": 6
      },
      "guest": {
        "id": "uuid",
        "fullName": "Nguyễn Văn A",
        "phone": "0912345678"
      }
    }
  ],
  "total": 5
}
```

---

### **6. Xem chi tiết 1 booking**

```http
GET /restaurants/bookings/:id
```

**Path Parameters:**
- `id` (UUID): Booking ID

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:** `200 OK`
```json
{
  "id": "booking-uuid",
  "restaurantId": "uuid",
  "guestId": "uuid",
  "bookingDate": "2025-12-25T00:00:00.000Z",
  "bookingTime": "19:00",
  "pax": 4,
  "status": "confirmed",
  "assignedTableId": "table-uuid",
  "specialRequests": "View đẹp, ghế em bé",
  "durationMinutes": 120,
  "createdAt": "2025-12-20T08:00:00.000Z",
  "restaurant": {
    "id": "uuid",
    "name": "Golden Dragon Restaurant",
    "cuisineType": "Vietnamese Fusion",
    "location": "Tầng 5, Grand Hotel",
    "phone": "0123456789",
    "openingHours": "06:00 - 23:00"
  },
  "assignedTable": {
    "id": "table-uuid",
    "tableNumber": "T05",
    "capacity": 6,
    "status": "reserved"
  },
  "guest": {
    "id": "uuid",
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "phone": "0912345678"
  }
}
```

**Error:** `404 Not Found` nếu booking không tồn tại

---

### **7. Cập nhật booking**

```http
PUT /restaurants/bookings/:id
```

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:** (Tất cả fields đều optional)
```json
{
  "bookingDate": "2025-12-26",
  "bookingTime": "20:00",
  "pax": 6,
  "specialRequests": "Cập nhật: Cần bàn view sông"
}
```

**Response:** `200 OK` (Same format as GET booking detail)

**⚠️ Note:** 
- Chỉ có thể update booking với status `pending` hoặc `confirmed`
- Không thể update booking đã `seated`, `completed`, hoặc `cancelled`

---

### **8. Hủy booking**

```http
POST /restaurants/bookings/:id/cancel
```

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:** `200 OK`
```json
{
  "id": "booking-uuid",
  "status": "cancelled",
  "message": "Booking has been cancelled successfully"
}
```

**Business Logic:**
- Status chuyển thành `cancelled`
- Nếu có `assignedTableId`, table được free (status → `available`)

---

### **9. Xác nhận booking (Admin/Staff only)**

```http
POST /restaurants/bookings/:id/confirm
```

**Response:** `200 OK`
```json
{
  "id": "booking-uuid",
  "status": "confirmed",
  "message": "Booking confirmed successfully"
}
```

**Status Flow:** `pending` → `confirmed`

---

### **10. Xếp chỗ ngồi (Admin/Staff only)**

```http
POST /restaurants/bookings/:id/seat
```

**Request Body:**
```json
{
  "tableId": "table-uuid"
}
```

**Response:** `200 OK`
```json
{
  "id": "booking-uuid",
  "status": "seated",
  "assignedTableId": "table-uuid",
  "assignedTable": {
    "id": "table-uuid",
    "tableNumber": "T08",
    "capacity": 4,
    "status": "occupied"
  }
}
```

**Status Flow:** `confirmed` → `seated`
**Table Status:** `available` → `occupied`

---

### **11. Hoàn thành booking (Admin/Staff only)**

```http
POST /restaurants/bookings/:id/complete
```

**Response:** `200 OK`
```json
{
  "id": "booking-uuid",
  "status": "completed",
  "message": "Booking completed successfully"
}
```

**Status Flow:** `seated` → `completed`
**Table Status:** `occupied` → `available`

---

## 📊 DATA MODELS

### **Restaurant**
```typescript
{
  id: string (UUID)
  propertyId: string (UUID)
  name: string
  description?: string
  cuisineType?: string      // "Vietnamese", "Italian", "Japanese"...
  location?: string
  openingHours?: string     // "06:00 - 23:00"
  rating?: number           // 0-5
  images?: string[]
  property?: Property
  tables?: Table[]
  areas?: RestaurantArea[]
}
```

### **Table**
```typescript
{
  id: string (UUID)
  restaurantId: string (UUID)
  areaId?: string (UUID)
  tableNumber: string       // "T01", "VIP-01"...
  capacity: number          // 2, 4, 6, 8...
  status: 'available' | 'occupied' | 'reserved'
  restaurant?: Restaurant
  area?: RestaurantArea
}
```

### **TableBooking**
```typescript
{
  id: string (UUID)
  restaurantId: string (UUID)
  guestId?: string (UUID)
  reservationId?: string (UUID)
  bookingDate: Date         // Date only
  bookingTime: string       // "19:00", "20:30"...
  pax: number              // Số người
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'no_show' | 'cancelled'
  assignedTableId?: string (UUID)
  specialRequests?: string
  durationMinutes: number   // Default: 90
  createdAt: Date
  restaurant?: Restaurant
  guest?: Guest
  assignedTable?: Table
}
```

### **RestaurantArea**
```typescript
{
  id: string (UUID)
  restaurantId: string (UUID)
  name: string              // "VIP Area", "Outdoor", "Main Dining"
  description?: string
  restaurant?: Restaurant
  tables?: Table[]
}
```

---

## 🎨 UI/UX RECOMMENDATIONS

### **1. Restaurant List Screen**
- Grid/List view với hình ảnh
- Hiển thị: name, cuisineType, rating, location
- Filter: cuisineType, propertyId
- Search bar

### **2. Restaurant Detail Screen**
- Image carousel
- Info: name, description, openingHours, location, phone
- Stats cards:
  - Tổng số bàn
  - Số bàn trống
  - Capacity range (min - max)
- CTA button: "Đặt bàn ngay"

### **3. Booking Form Screen**
- Date picker (không cho chọn ngày quá khứ)
- Time picker (theo openingHours, step 30 phút)
- Guest count stepper (1-12)
- Contact info: name, phone
- Special requests (textarea)
- "Check Available Tables" button
- "Xác nhận đặt bàn" button

### **4. Booking Confirmation Screen**
- Booking details summary
- QR code (chứa booking ID)
- Buttons: "View in My Bookings", "Share", "Add to Calendar"

### **5. My Bookings Screen**
- Tabs: "Upcoming", "Past", "Cancelled"
- List items với status badge
- Quick actions: "View Details", "Cancel", "Modify"

---

## 🔐 AUTHENTICATION

### **Required for:**
- POST /restaurants/bookings (Tạo booking)
- GET /restaurants/bookings (Xem bookings của mình)
- GET /restaurants/bookings/:id (Chi tiết booking)
- PUT /restaurants/bookings/:id (Update booking)
- POST /restaurants/bookings/:id/cancel (Hủy booking)

### **Public endpoints:**
- GET /restaurants (Xem danh sách)
- GET /restaurants/:id (Chi tiết nhà hàng)
- GET /restaurants/tables/available (Check bàn trống)

### **Admin/Staff only:**
- POST /restaurants/bookings/:id/confirm
- POST /restaurants/bookings/:id/seat
- POST /restaurants/bookings/:id/complete

---

## 🎯 BUSINESS RULES

### **Booking Creation Rules:**
1. ✅ User phải đăng nhập
2. ✅ `bookingDate` không được là quá khứ
3. ✅ `bookingTime` phải trong `openingHours`
4. ✅ `pax` phải từ 1-12
5. ✅ Phải có ít nhất 1 bàn available với capacity đủ
6. ✅ Default status: `pending`
7. ✅ Default duration: 90 phút

### **Cancellation Rules:**
1. ✅ Chỉ cancel được booking với status `pending` hoặc `confirmed`
2. ✅ Không thể cancel `seated`, `completed`, hoặc `no_show`
3. ✅ Sau khi cancel, free up table nếu có `assignedTableId`

### **Table Assignment:**
1. ✅ Tự động chọn bàn nhỏ nhất phù hợp (`capacity >= pax`)
2. ✅ Ưu tiên bàn có capacity gần với số người nhất
3. ✅ Chỉ assign bàn có `status = 'available'`

### **Status Transitions:**
```
pending → confirmed → seated → completed
   ↓          ↓          ↓
cancelled  cancelled  no_show
```

---

## 🚨 ERROR HANDLING

### **Common Error Codes:**

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 400 | Bad Request | Validation error, invalid date format |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Trying to access other user's booking |
| 404 | Not Found | Restaurant, Booking, Table not found |
| 409 | Conflict | Table already booked, duplicate booking |
| 500 | Internal Error | Server error |

### **Error Response Format:**
```json
{
  "statusCode": 400,
  "message": "Validation failed: pax must be at least 1",
  "error": "Bad Request"
}
```

---

## 📱 MOBILE APP CHECKLIST

### **Must Have Features:**
- [ ] List restaurants với pagination
- [ ] View restaurant detail (bao gồm tables info)
- [ ] Check available tables theo date/time/party size
- [ ] Create booking form với validation
- [ ] View my bookings list (with filters)
- [ ] View booking detail
- [ ] Cancel booking
- [ ] Modify booking (date/time/pax)
- [ ] Booking confirmation screen với QR code
- [ ] Push notification (khi booking confirmed/cancelled)

### **Nice to Have:**
- [ ] Add to calendar integration
- [ ] Share booking details
- [ ] Restaurant reviews & ratings
- [ ] Photo gallery for restaurants
- [ ] Map integration (restaurant location)
- [ ] Filter by cuisine type
- [ ] Favorite restaurants
- [ ] Recent bookings quick access

---

## 🧪 TESTING SCENARIOS

### **Happy Path:**
1. User xem danh sách nhà hàng
2. Chọn nhà hàng → Xem chi tiết
3. Click "Đặt bàn" → Điền form (ngày mai, 19:00, 4 người)
4. Submit → Nhận booking ID với status `pending`
5. Vào My Bookings → Thấy booking mới tạo
6. View detail booking → Xem đầy đủ thông tin
7. Cancel booking → Status → `cancelled`

### **Edge Cases:**
1. Đặt bàn cho ngày quá khứ → Error 400
2. Đặt bàn ngoài giờ mở cửa → Error 400
3. Đặt 20 người (vượt max) → Error 400
4. Không có bàn available → Show message "Hết bàn"
5. Cancel booking đã completed → Error 400
6. Update booking của user khác → Error 403

---

## 🔄 SYNCHRONIZATION

### **Real-time Updates:**
- Khi table status thay đổi → Update available tables
- Khi booking confirmed → Push notification
- Khi booking cancelled by admin → Push notification

### **Offline Support:**
- Cache restaurant list
- Cache my bookings
- Queue booking requests khi offline → Sync khi online

---

## 📞 SUPPORT & CONTACT

**Backend API Issues:**
- Contact: Backend Team
- Swagger Doc: `http://your-domain.com/docs`

**Business Logic Questions:**
- Contact: Product Owner

**Mobile App Issues:**
- Log errors với booking ID
- Include user info, timestamp, request/response

---

## ✅ FINAL NOTES

1. **Authentication:** JWT token required cho hầu hết endpoints
2. **Rate Limiting:** 100 requests/phút/IP
3. **Timezone:** Tất cả dates/times dùng UTC, convert ở client side
4. **Pagination:** Default page=1, limit=10, max limit=100
5. **Response Time:** Average < 500ms
6. **API Version:** v1 (có thể có breaking changes, follow changelog)

---

**Document Version:** 1.0
**Last Updated:** December 24, 2025
**Maintained by:** Backend Team
