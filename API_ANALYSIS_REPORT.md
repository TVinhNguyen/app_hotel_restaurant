# 🔍 API ENDPOINT ANALYSIS REPORT

## ❌ **CÁC LỖI NGHIÊM TRỌNG ĐÃ TÌM THẤY**

### 1. ❌ **RESERVATIONS - Endpoints Không Tồn Tại**

#### **Lỗi 1.1: GET_BY_GUEST**
```typescript
// ❌ WRONG - Trong constants/index.ts và reservationService.ts
GET_BY_GUEST: (guestId: string) => `/reservations/guest/${guestId}`
// API: GET /api/v1/reservations/guest/{guestId}
```

**✅ FIX:** Endpoint này **KHÔNG TỒN TẠI** trong API documentation!  
**Giải pháp:** Dùng query param thay vì path param:
```typescript
// ✅ CORRECT
getReservationsByGuest(guestId: string) {
  return apiService.get('/reservations', { params: { guestId } });
}
// API: GET /api/v1/reservations?guestId={guestId}
```

---

#### **Lỗi 1.2: GET_BY_PROPERTY**
```typescript
// ❌ WRONG
GET_BY_PROPERTY: (propertyId: string) => `/reservations/property/${propertyId}`
// API: GET /api/v1/reservations/property/{propertyId}
```

**✅ FIX:** Endpoint này cũng **KHÔNG TỒN TẠI**!
```typescript
// ✅ CORRECT
getReservationsByProperty(propertyId: string) {
  return apiService.get('/reservations', { params: { propertyId } });
}
// API: GET /api/v1/reservations?propertyId={propertyId}
```

---

#### **Lỗi 1.3: CHECK_AVAILABILITY**
```typescript
// ❌ WRONG
CHECK_AVAILABILITY: '/reservations/check-availability'
// API: GET /api/v1/reservations/check-availability
```

**✅ FIX:** Endpoint này **KHÔNG TỒN TẠI** trong API doc!  
Có thể backend chưa implement hoặc đổi endpoint khác.

---

#### **Lỗi 1.4: CHECK_IN và CHECK_OUT - Method SAI**
```typescript
// ❌ WRONG - Đang dùng PUT
async checkIn(id: string, data: any) {
  return apiService.put(`/reservations/${id}/check-in`, data);
}

async checkOut(id: string, data: any) {
  return apiService.put(`/reservations/${id}/check-out`, data);
}
```

**Theo API Documentation:**
```json
"/api/v1/reservations/{id}/checkin": {
  "post": { ... }  // ← POST, không phải PUT
}
"/api/v1/reservations/{id}/checkout": {
  "post": { ... }  // ← POST, không phải PUT
}
```

**✅ FIX:**
```typescript
// ✅ CORRECT - Dùng POST và path là "checkin" (không có dấu gạch ngang)
async checkIn(id: string, data: any) {
  return apiService.post(`/reservations/${id}/checkin`, data);
}

async checkOut(id: string, data: any) {
  return apiService.post(`/reservations/${id}/checkout`, data);
}
```

---

### 2. ❌ **TABLE_BOOKINGS - Endpoint Path SAI**

#### **Lỗi 2.1: CANCEL Table Booking**
```typescript
// ❌ WRONG - Trong constants/index.ts
TABLE_BOOKINGS: {
  CANCEL: (id: string) => `/restaurants/bookings/${id}`,  // ← Trùng với UPDATE
}
```

**Theo API Documentation:**
```json
"/api/v1/restaurants/bookings/{id}/cancel": {
  "post": { ... }  // ← POST /restaurants/bookings/{id}/cancel
}
```

**✅ FIX:**
```typescript
// ✅ CORRECT
TABLE_BOOKINGS: {
  CANCEL: (id: string) => `/restaurants/bookings/${id}/cancel`,
}

// Và phải dùng POST, không phải DELETE
async cancelTableBooking(bookingId: string) {
  return apiService.post(`/restaurants/bookings/${bookingId}/cancel`);
}
```

---

### 3. ❌ **ROOM - Endpoint Path Thiếu**

#### **Lỗi 3.1: Assign Room to Reservation**
```typescript
// ❌ WRONG - Endpoint không có trong constants
// Nhưng có trong API documentation
```

**Theo API Documentation:**
```json
"/api/v1/reservations/{id}/room": {
  "put": {
    "operationId": "ReservationsController_assignRoom_v1",
    "summary": "Assign room to reservation"
  }
}
```

**✅ FIX:** Thêm vào constants:
```typescript
RESERVATIONS: {
  // ... existing endpoints
  ASSIGN_ROOM: (id: string) => `/reservations/${id}/room`,
}
```

---

## 📋 **DANH SÁCH CẦN FIX**

### **Priority 1 - Urgent (Breaking Issues)**
- [ ] Fix `getReservationsByGuest()` - Dùng query param
- [ ] Fix `getReservationsByProperty()` - Dùng query param
- [ ] Fix `checkIn()` - POST thay vì PUT, path `checkin` không có dấu gạch ngang
- [ ] Fix `checkOut()` - POST thay vì PUT, path `checkout` không có dấu gạch ngang
- [ ] Fix `cancelTableBooking()` - POST thay vì DELETE, path thêm `/cancel`

### **Priority 2 - Medium (Feature Missing)**
- [ ] Remove `CHECK_AVAILABILITY` hoặc implement đúng
- [ ] Add `ASSIGN_ROOM` endpoint

### **Priority 3 - Low (Enhancement)**
- [ ] Review các endpoints khác trong services

---

## 🔧 **CODE FIXES**

### **File: src/constants/index.ts**
```typescript
RESERVATIONS: {
  GET_ALL: '/reservations',
  CREATE: '/reservations',
  GET_BY_ID: (id: string) => `/reservations/${id}`,
  UPDATE: (id: string) => `/reservations/${id}`,
  CANCEL: (id: string) => `/reservations/${id}/cancel`,
  
  // ✅ FIXED: Đổi từ check-in sang checkin
  CHECK_IN: (id: string) => `/reservations/${id}/checkin`,
  CHECK_OUT: (id: string) => `/reservations/${id}/checkout`,
  
  // ❌ REMOVED: Không tồn tại trong API
  // GET_BY_GUEST: (guestId: string) => `/reservations/guest/${guestId}`,
  // GET_BY_PROPERTY: (propertyId: string) => `/reservations/property/${propertyId}`,
  // CHECK_AVAILABILITY: '/reservations/check-availability',
  
  // ✅ ADDED: Endpoint mới
  ASSIGN_ROOM: (id: string) => `/reservations/${id}/room`,
},

TABLE_BOOKINGS: {
  GET_ALL: '/restaurants/bookings',
  CREATE: '/restaurants/bookings',
  GET_BY_ID: (id: string) => `/restaurants/bookings/${id}`,
  UPDATE: (id: string) => `/restaurants/bookings/${id}`,
  
  // ✅ FIXED: Thêm /cancel vào path
  CANCEL: (id: string) => `/restaurants/bookings/${id}/cancel`,
  
  CONFIRM: (id: string) => `/restaurants/bookings/${id}/confirm`,
  SEAT: (id: string) => `/restaurants/bookings/${id}/seat`,
  COMPLETE: (id: string) => `/restaurants/bookings/${id}/complete`,
},
```

### **File: src/services/reservationService.ts**
```typescript
class ReservationService {
  // ✅ FIXED: Dùng query param thay vì endpoint riêng
  async getReservationsByGuest(guestId: string) {
    return this.getReservations({ guestId });
  }

  async getReservationsByProperty(propertyId: string, params?: any) {
    return this.getReservations({ property_id: propertyId, ...params });
  }

  // ✅ FIXED: Dùng POST và đổi path
  async checkIn(id: string, data: any) {
    return apiService.post(
      API_CONFIG.ENDPOINTS.RESERVATIONS.CHECK_IN(id),
      data
    );
  }

  async checkOut(id: string, data?: any) {
    return apiService.post(
      API_CONFIG.ENDPOINTS.RESERVATIONS.CHECK_OUT(id),
      data
    );
  }

  // ✅ ADDED: Assign room endpoint
  async assignRoom(id: string, roomId: string) {
    return apiService.put(
      API_CONFIG.ENDPOINTS.RESERVATIONS.ASSIGN_ROOM(id),
      { assigned_room_id: roomId }
    );
  }

  // ❌ REMOVED: Endpoint không tồn tại
  // async checkAvailability(data: any) { ... }
}
```

### **File: src/services/tableBookingService.ts**
```typescript
// ✅ FIXED: Dùng POST thay vì DELETE
export const cancelTableBooking = async (bookingId: string): Promise<any> => {
  const url = API_CONFIG.ENDPOINTS.TABLE_BOOKINGS.CANCEL(bookingId);
  const response: any = await apiService.post(url);
  return response.data || response;
};
```

---

## 📊 **TỔNG KẾT**

| **Loại Lỗi** | **Số Lượng** | **Mức Độ** |
|---------------|--------------|------------|
| Endpoint không tồn tại | 3 | 🔴 Critical |
| Method HTTP sai | 3 | 🔴 Critical |
| Path sai | 1 | 🟡 Medium |
| **TỔNG** | **7 lỗi** | |

---

## ✅ **TESTING CHECKLIST**

Sau khi fix, cần test:
- [ ] Login/Register → Check user data lưu đúng
- [ ] My Booking → Hiển thị đúng bookings của user
- [ ] Booking Detail → Load chi tiết đúng
- [ ] Check-in/Check-out → Gọi API thành công
- [ ] Table Booking → Cancel thành công
