# 🐛 Debug: Booking hiển thị sai cho tài khoản mới

## Vấn đề
Khi tạo tài khoản mới, màn hình **My Booking** vẫn hiển thị các booking của tài khoản cũ/khác.

## Nguyên nhân có thể
1. ❌ AsyncStorage chưa được clear khi logout/đăng ký mới
2. ❌ User data cũ vẫn còn trong AsyncStorage
3. ❌ GuestId không khớp với user mới
4. ❌ Backend API không filter đúng theo guestId

## Các sửa đổi đã thực hiện

### 1. ✅ Thêm Logging Chi Tiết (MyBookingScreen.tsx)
```tsx
// Giờ sẽ log ra:
// 📱 Stored user data
// 👤 Current user email
// ✅ Found guest ID
// 🔍 Fetching reservations for guestId
// 📦 Reservations response
// 📊 Total reservations found
```

### 2. ✅ Clear AsyncStorage Khi Login (LoginScreen.tsx)
```tsx
// Trước khi lưu user mới, clear data cũ
await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
```

### 3. ✅ Sửa Flow Đăng Ký (RegisterScreen.tsx)
- Clear AsyncStorage trước khi lưu user mới
- Lưu user data ngay sau khi đăng ký
- Tự động navigate to MainTabs thay vì Login

### 4. ✅ Cải Thiện Logout (ProfileScreen.tsx)
- Clear hoàn toàn user data
- Verify data đã cleared
- Reset navigation về Login

## Cách Test

### Test Case 1: Tạo Tài Khoản Mới
1. **Logout** khỏi tài khoản hiện tại (nếu có)
2. Vào màn hình **Register**
3. Tạo tài khoản mới với email mới (ví dụ: `test@example.com`)
4. Sau khi đăng ký thành công, app sẽ tự động vào MainTabs
5. Vào màn hình **My Booking**
6. **Kỳ vọng**: Không có booking nào (hiển thị "No booked hotels yet")

### Test Case 2: Chuyển Đổi Giữa Các Tài Khoản
1. Login với tài khoản A (có bookings)
2. Kiểm tra **My Booking** → Thấy bookings của tài khoản A
3. **Logout**
4. Login với tài khoản B (mới, chưa có bookings)
5. Kiểm tra **My Booking** → **Không được** thấy bookings của tài khoản A

### Test Case 3: Kiểm Tra Console Logs
Mở console và tìm các log sau:

#### ✅ Khi Logout Thành Công
```
🚪 [Logout] Clearing user data...
✅ [Logout] Token cleared: true
✅ [Logout] User data cleared: true
```

#### ✅ Khi Login Thành Công
```
💾 [Login] Saving user data: { email: "...", name: "..." }
```

#### ✅ Khi Vào My Booking
```
📱 [MyBooking] Stored user data: {...}
👤 [MyBooking] Current user email: test@example.com
✅ [MyBooking] Found guest ID: abc-123-def
🔍 [MyBooking] Fetching reservations for guestId: abc-123-def
📊 [MyBooking] Total reservations found: 0
```

#### ❌ Nếu Vẫn Lỗi
Nếu log hiển thị:
```
📊 [MyBooking] Total reservations found: 5
```
Nhưng user mới chưa book gì → **Vấn đề ở Backend API**

## Kiểm Tra Backend API

### Endpoint: GET /api/v1/reservations?guestId=xxx

Test API trực tiếp:
```bash
curl -X GET "http://34.151.224.213:4000/api/v1/reservations?guestId=NEW_GUEST_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Kỳ vọng**: Trả về danh sách rỗng `[]` hoặc `{ data: [] }` cho guest mới

## Nếu Vẫn Còn Lỗi

### Bước 1: Clear AsyncStorage Thủ Công
Thêm code tạm thời vào `MyBookingScreen.tsx`:
```tsx
// Thêm vào đầu fetchBookings()
await AsyncStorage.clear(); // CLEAR TẤT CẢ - chỉ dùng để test
console.log('⚠️ Cleared all AsyncStorage');
```

### Bước 2: Kiểm Tra Guest Email
Trong `findGuestByEmail()`, thêm log:
```tsx
console.log('🔍 Searching guest with email:', email);
console.log('📦 Found guests:', response.data);
```

### Bước 3: Kiểm Tra Query Params
Trong `reservationService.getReservations()`, log:
```tsx
console.log('🌐 API Request:', API_CONFIG.ENDPOINTS.RESERVATIONS.GET_ALL);
console.log('🔑 Params:', { guestId });
```

## Kết Luận

Sau các sửa đổi:
- ✅ Login/Logout đã clear data đúng cách
- ✅ Register tự động login và lưu user data
- ✅ MyBooking có logging chi tiết để debug
- ✅ Kiểm tra guestId trước khi fetch

**Nếu vẫn lỗi sau các sửa đổi này** → Vấn đề nằm ở Backend API không filter đúng theo guestId.
