
# UIT AUTO LOGIN 

## 1. Chức năng
Đây là một Chrome Extension dùng để: 

- Mở các trang web của UIT một cách nhanh chóng.
- Tự động đăng nhập các trang web đó.

## 2. Cài đặt 
> [!NOTE]
> Đây là hướng dẫn cho Google Chrome, các trình duyệt khác các bạn cũng có thể cài theo tương tự!

- **Bước 1: Tải file sau về và giải nén**
> [uit-auto-login](https://github.com/giakiet05/uit-auto-login/releases/download/v1.0.0/uit-auto-login.zip)

- **Bước 2: Load extension lên Chrome**
1. Vào Chrome => chọn **⋮** => Extension => Manage Extension
2. Bật Developer Mode (góc trên bên phải)
3. Chọn Load Unpacked => Chọn thư mục vừa giải nén => **Xong**

> [!IMPORTANT]
> - Hiện tại, extension chưa thể tự đăng nhập vào Student và Daa do 2 trang này có chứa Captcha (rất khó phá và mình không biết cách phá).
> - Để tạm thời giải quyết vấn đề này, các bạn vui lòng làm thêm một số bước sau đây.

**Bước 3: Cài user script tự động check Captcha**

1. Cài [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) trên Chrome Web Store
2. Copy script ở [đây](https://greasyfork.org/en/scripts/494965-auto-click-i-m-not-a-robot/code?fbclid=IwZXh0bgNhZW0CMTEAAR3zGL3Hs6jzN6XcI9l-JeW_-fnytghMQVRPxX0G4QAbCKYjDYS6oRqbw0k_aem_EzoheU6LQoTRWwWMRc3QwQ)
3. Mở Tampermonkey => Create a new script
4. Dán script vào => File => Save
5. Enable script
   
_Tới đây bạn đã có thể tự đăng nhập được vào 2 trang web trên._

**Bước 4 (Optional): Cài Buster**

Trong một vài trường hợp, Captcha có thể yêu cầu bạn giải câu đố, để tiết kiệm thời gian giải, hãy cài thêm extension này:
> [Buster](https://chromewebstore.google.com/detail/buster-captcha-solver-for/mpbjkejclgfgadiemmefgebjfooflfhl)

Bạn chỉ cần cài và đảm bảo extension này được bật.

## 3. Hướng dẫn sử dụng
Sau khi hoàn thành các bước cài đặt thì bạn có thể sử dụng ngay tính năng mở trang web.

Để tự động đăng nhập, bạn cần phải cài đặt một xíu.

- **Bước 1:** Chuyển sang tab cài đặt

- **Bước 2:** Chọn các trang web bạn muốn tự đăng nhập

- **Bước 3:** Nhập MSSV và mật khẩu bạn dùng để đăng nhập => Lưu
  
