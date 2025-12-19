# 🧪 Test API Endpoints - Debug Booking Issue

## Vấn đề
Tài khoản mới vẫn thấy 3 bookings trong tab "Booked" dù chưa đặt gì.

## Các Sửa Đổi Mới

### 1. ✅ Đổi từ `getReservations()` sang `getReservationsByGuest()`

**Trước:**
```typescript
const response = await reservationService.getReservations({ guestId });
// API: GET /api/v1/reservations?guestId=xxx
```

**Sau:**
```typescript
const response = await reservationService.getReservationsByGuest(guestId);
// API: GET /api/v1/reservations/guest/{guestId}
```

### 2. ✅ Thêm Logging Chi Tiết Trong GuestService
- Log endpoint đầy đủ
- Log raw response
- Log guest ID và email

---

## Test Ngay Bây Giờ

### Bước 1: Restart App
```bash
# Stop current server (Ctrl+C)
npm start
```

### Bước 2: Kiểm Tra Console Logs

#### 📱 Khi Vào My Booking - Tài Khoản Mới

Bạn sẽ thấy logs như sau:

```
📱 [MyBooking] Stored user data: {"email":"new@example.com",...}
👤 [MyBooking] Current user email: new@example.com

🔍 [GuestService] Searching guest with email: new@example.com
🌐 [GuestService] API endpoint: http://34.151.224.213:4000/api/v1/guests?email=new@example.com
📦 [GuestService] Raw response: {...}
✅ [GuestService] Found guest: {...}
✅ [GuestService] Guest ID: abc-123-new-guest

✅ [MyBooking] Found guest ID: abc-123-new-guest

🔍 [MyBooking] Fetching reservations for guestId: abc-123-new-guest
👤 [MyBooking] Using getReservationsByGuest() method
📦 [MyBooking] Reservations response: {...}
📊 [MyBooking] Total reservations found: 0   ← PHẢI LÀ 0 CHO TÀI KHOẢN MỚI
```

---

## Test Thủ Công với cURL

### Test 1: Kiểm Tra Guest Được Tạo
```bash
# Lấy token từ AsyncStorage hoặc login response
TOKEN="your-access-token-here"

# Test endpoint tìm guest theo email
curl -X GET "http://34.151.224.213:4000/api/v1/guests?email=new@example.com" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# [
#   {
#     "id": "abc-123",
#     "email": "new@example.com",
#     "name": "New User"
#   }
# ]
```

### Test 2: Kiểm Tra Reservations Theo Guest ID
```bash
# Sử dụng guest ID từ Test 1
GUEST_ID="abc-123"

# Method cũ (có thể trả về sai)
curl -X GET "http://34.151.224.213:4000/api/v1/reservations?guestId=$GUEST_ID" \
  -H "Authorization: Bearer $TOKEN"

# Method mới (đúng) - ĐANG DÙNG
curl -X GET "http://34.151.224.213:4000/api/v1/reservations/guest/$GUEST_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response for NEW guest:
# []
# or
# {"data": [], "total": 0}
```

### Test 3: Kiểm Tra Guest Khác
```bash
# Lấy guest khác để so sánh
curl -X GET "http://34.151.224.213:4000/api/v1/guests" \
  -H "Authorization: Bearer $TOKEN"

# Lấy reservations của guest khác
curl -X GET "http://34.151.224.213:4000/api/v1/reservations/guest/OTHER_GUEST_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Các Trường Hợp Có Thể Xảy Ra

### ✅ Case 1: Fix Thành Công
```
📊 [MyBooking] Total reservations found: 0
→ Không hiển thị booking nào trong app
→ VẤN ĐỀ ĐÃ ĐƯỢC FIX!
```

### ⚠️ Case 2: API Endpoint Sai
```
📊 [MyBooking] Total reservations found: 3
📦 Response: [
  { id: "res-1", guestId: "other-guest-1" },
  { id: "res-2", guestId: "other-guest-2" },
  { id: "res-3", guestId: "other-guest-3" }
]
→ Backend API không filter đúng
→ Cần fix Backend
```

### ⚠️ Case 3: Guest ID Sai
```
✅ [GuestService] Guest ID: abc-123
🔍 [MyBooking] Fetching reservations for guestId: xyz-999  ← KHÁC NHAU!
→ Logic lấy guestId bị lỗi
→ Kiểm tra lại code
```

### ⚠️ Case 4: Không Tìm Thấy Guest
```
⚠️ [MyBooking] No guest found for email: new@example.com
→ Guest profile chưa được tạo trong database
→ Kiểm tra RegisterScreen có tạo guest không
```

---

## Nếu Vẫn Còn Lỗi Sau Khi Dùng `getReservationsByGuest()`

### Option A: Backend API Endpoint Không Hoạt Động
Test endpoint trực tiếp:
```bash
curl -X GET "http://34.151.224.213:4000/api/v1/reservations/guest/YOUR_GUEST_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Nếu trả về lỗi 404 → Backend chưa implement endpoint này

### Option B: Backend Không Filter Đúng
Nếu endpoint tồn tại nhưng vẫn trả về reservations của guest khác:
→ Bug ở Backend, cần fix query filter

### Giải Pháp Tạm Thời (Client-Side Filter)
Nếu không thể fix Backend ngay, thêm vào MyBookingScreen:

```typescript
// Sau khi fetch reservations
const verifiedReservations = basicReservations.filter(res => {
  const resGuestId = res.guestId || res.guest_id || res.guest?.id;
  return resGuestId === guestId;
});
basicReservations = verifiedReservations;
```

---

## Debug Checklist

- [ ] Restart app (`npm start`)
- [ ] Logout khỏi tài khoản cũ
- [ ] Đăng ký tài khoản mới với email chưa dùng
- [ ] Vào My Booking → Booked tab
- [ ] Check console logs
- [ ] Verify guest ID matches
- [ ] Verify reservations count = 0

## Console Output Mẫu (Khi Thành Công)

```
🚪 [Logout] Clearing user data...
✅ [Logout] Token cleared: true
✅ [Logout] User data cleared: true

💾 [Register] Saving user data: {"email":"test2@test.com","name":"Test User 2"}
Step 2: Creating guest profile for: test2@test.com
✅ Guest profile created: 550e8400-e29b-41d4-a716-446655440002

📱 [MyBooking] Stored user data: {"email":"test2@test.com",...}
👤 [MyBooking] Current user email: test2@test.com

🔍 [GuestService] Searching guest with email: test2@test.com
✅ [GuestService] Guest ID: 550e8400-e29b-41d4-a716-446655440002

🔍 [MyBooking] Fetching reservations for guestId: 550e8400-e29b-41d4-a716-446655440002
👤 [MyBooking] Using getReservationsByGuest() method
📊 [MyBooking] Total reservations found: 0

→ No booked hotels yet (Empty state displayed)
```
