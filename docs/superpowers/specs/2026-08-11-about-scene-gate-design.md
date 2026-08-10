# About Face: Scene Gate và Rubik Choreography

## Mục tiêu

Face **About** phải có các khối nội dung 3D tự hoán vị theo một nhịp Rubik rõ ràng, tự nhiên và có chủ đích. Khi người dùng lật sang bất kỳ face nào khác, không được có frame nào lộ mặt đáy, mặt cạnh, backplane hoặc không gian sâu của About.

Phạm vi gồm:

- cô lập scene 3D của About khỏi animation lật face;
- choreography hoán vị tự động 8 giây một chu kỳ;
- dừng và niêm phong scene ngay khi người dùng điều hướng;
- hỗ trợ `prefers-reduced-motion` và kiểm thử hồi quy cho transition.

Không thay đổi bố cục, nội dung hoặc hành vi của các face ngoài About, ngoài điểm đồng bộ transition cần thiết trong store/hook hiện có.

## Bằng chứng và giả thuyết nguyên nhân

Qua kiểm tra mã hiện tại:

- `AboutFace.module.css` buộc face và `gridContainer` dùng `overflow: visible` để tránh CSS flattening; scene có `preserve-3d`, side faces, backplane và các phần tử có `translateZ`.
- Các face grid khác, bao gồm Contact, dùng một bề mặt grid kín với `overflow: hidden`.
- Lệnh flip dùng class toàn cục `.rubik-flipping`, nhưng hiện tại chỉ cố ép phẳng/hide từng phần trong cùng scene 3D. Scene đó vẫn là một thành phần của pipeline compositing khi face cha bắt đầu xoay.

Giả thuyết cần được xác thực bằng regression test là: **vùng 3D không được cô lập khỏi face flip; việc thay đổi style giữa React, CSS và GPU compositing có thể để lộ một frame có chiều sâu**. Thiết kế dưới đây loại bỏ phụ thuộc vào việc “ép phẳng kịp lúc”, thay bằng cách không đưa scene 3D vào cú flip.

## Kiến trúc

`AboutFace` được tách thành ba đơn vị có ranh giới rõ ràng:

| Đơn vị | Trách nhiệm | Không làm |
| --- | --- | --- |
| `AboutSafeSurface` | Dựng năm front tile 2D, cùng layout/màu với scene hiện tại. Là bề mặt duy nhất được phép hiện trong lúc lật. | Không dùng `preserve-3d`, transform Z, shadow 3D, input hay semantic nội dung trùng lặp. |
| `AboutScene` | Dựng khối 3D, side faces, shadow và choreography khi About active. | Không tự quyết định trạng thái điều hướng hoặc render trong lúc gate sealed. |
| Scene gate | Điều phối `live → sealed → live` bằng selector DOM đồng bộ và trạng thái lifecycle của store. | Không phụ thuộc vào một React render để che frame đầu tiên. |

`AboutSafeSurface` luôn tồn tại trong DOM để không cần mount trong thời điểm chuyển face. Nó mặc định ẩn, `aria-hidden` và `pointer-events: none`. `AboutScene` chứa toàn bộ nội dung tương tác và semantic thật.

Scene gate dùng class `.rubik-flipping` đã được thêm đồng bộ trong `startFlip`:

```text
About active       : safe surface hidden, scene 3D visible, choreography may run
Flip requested     : safe surface visible, scene 3D visibility hidden, choreography stopped
GSAP face flip     : chỉ safe surface 2D có thể được compositing
Flip complete      : React cập nhật active face; đến requestAnimationFrame kế tiếp mới bỏ gate
About active again : safe surface hidden, scene 3D visible, choreography bắt đầu chu kỳ mới
```

`completeFlip` phải bỏ `.rubik-flipping` sau khi Zustand đã publish trạng thái cuối và browser có một frame để commit. Điều này tránh một frame cuối nơi class đã bị bỏ nhưng face cũ chưa bị React ẩn.

## Bố cục khối và choreography

### Cấu trúc transform

Transform di chuyển mặt phẳng và transform chiều sâu không được nằm trên cùng một node. Mỗi block có hai lớp:

```text
blockLayout   absolute x/y/width/height, nhận FLIP inverse transform
└─ blockMotion preserve-3d, nhận translateZ/rotation/shadow/z-index theo choreography
   └─ box faces front/back/top/bottom/left/right
```

Nhờ vậy, animation layout không ghi đè depth motion và khối không “trượt xuyên” nhau do hai hệ transform tranh quyền sở hữu.

### Exchange plan có định hướng

Thay vì chọn một `LAYOUT_PRESETS` ngẫu nhiên bất kỳ, tạo một đồ thị plan có hướng. Mỗi plan khai báo:

- preset nguồn và preset đích;
- thứ tự block tham gia;
- độ nâng từng block (30–56px, theo kích thước viewport);
- lane và `z-index` khi di chuyển;
- độ trễ bắt đầu của từng block.

Khi plan khởi chạy, component chụp bounds trước khi đổi preset, commit preset đích, chụp bounds sau đó và dùng manual FLIP để giữ block ở vị trí pixel cũ. GSAP sau đó animate inverse `x/y` về 0. Khối chính dẫn đường, hai khối phụ nối theo; khối neo chỉ nhận một chuyển động lún rất nhẹ để tạo phản hồi vật lý.

### Nhịp 8 giây

| Khoảng thời gian | Hành vi |
| --- | --- |
| 0.0–6.6s | Idle: bố cục ổn định để đọc nội dung. |
| 6.6–6.84s | Lift: khối chính nâng lên; hai khối phụ lệch 80ms. Shadow tăng dần. |
| 6.84–7.52s | Travel: các block đi theo lane riêng đến layout đích; chỉ các block đã nhấc mới vượt lên trên. |
| 7.52–7.80s | Settle: từng block hạ về mặt grid, shadow giảm. |
| 7.80–8.0s | Lock: reset `z-index`, transform và timeline state; preset mới trở thành trạng thái đọc. |

Không dùng rotation lớn hoặc depth 80–130px như bản đang thử: chúng làm khối giống overlay UI hơn một cơ cấu vật lý và tăng nguy cơ lộ side face. Không dùng elastic bounce; điểm dừng ngắn, rõ và có trọng lượng.

Nếu người dùng bắt đầu flip trong lúc choreography chạy, timeline bị kill và commit preset đích trước khi gate được niêm phong. Safe surface hiển thị chính preset cuối, do đó cú lật không chứa trạng thái nửa chừng hoặc vết mờ của depth.

## Luồng trạng thái và lỗi biên

- Choreography chỉ được tạo khi `isActive && !isAnimating && !reducedMotion`.
- `isAnimating`, About mất active hoặc component unmount đều kill timeline, clear inline GSAP props cần thiết và không để timer tồn tại nền.
- Điều hướng xảy ra lúc idle, lift, travel hoặc settle đều phải dẫn đến cùng một trạng thái `sealed`.
- Safe surface không nhận focus/click; nội dung tương tác chỉ tồn tại ở `AboutScene` live.
- Với `prefers-reduced-motion`, blocks giữ layout tĩnh và không tự hoán vị. Scene gate vẫn hoạt động vì đây là bảo đảm về hiển thị, không phải hiệu ứng trang trí.
- Nếu ref/element cần cho flip không tồn tại, controller giữ hành vi fallback hiện có (`completeFlip`); gate vẫn được release sau trạng thái cuối để không kẹt scene.

## Thay đổi dự kiến

| File | Thay đổi |
| --- | --- |
| `src/components/faces/AboutFace.tsx` | Tách safe surface/scene, thay timer ngẫu nhiên bằng plan + GSAP timeline + manual FLIP, lifecycle cleanup. |
| `src/components/faces/AboutFace.module.css` | Tạo lớp gate, safe 2D surface, tách `blockLayout`/`blockMotion`, quy tắc visibility đồng bộ khi flip. |
| `src/store/useFaceStore.ts` | Giữ class gate đồng bộ lúc bắt đầu; release sau frame commit ở cuối flip. |
| `src/hooks/useFlipAnimation.ts` | Chỉ thay đổi nếu cần để xác nhận thứ tự lifecycle; không thay đổi trục, thời lượng hoặc easing của navigation khi chưa cần thiết. |

Các chỉnh sửa sẵn có trong worktree của người dùng được giữ nguyên và được xem như trạng thái đầu vào, không bị reset hoặc gộp vào commit spec.

## Kiểm thử và tiêu chí chấp nhận

### Regression assertion

Tạo kiểm tra nhỏ cho scene gate: trong `.rubik-flipping`, computed style của `AboutScene` phải là hidden/non-rendered và `AboutSafeSurface` phải hiển thị; timeline choreography phải bị dừng. Sau `completeFlip` và frame kế tiếp, scene chỉ live nếu About là active.

### Ma trận kiểm thử thủ công

1. About ↔ Intro, Menu, Projects và Contact, theo mọi hướng có thể từ bản đồ navigation.
2. Rời About khi idle, lift, travel và settle.
3. Lặp nhiều chu kỳ bằng wheel, keyboard và swipe; không để input bị khoá sau flip.
4. Mở lại About sau mỗi face để kiểm tra choreography chỉ chạy khi active và luôn có thể khởi động lại.
5. Chạy với `prefers-reduced-motion`.
6. Chạy `npm run lint` và `npm run build` sau khi implementation hoàn thành. Không khởi chạy `npm run dev`; dùng dev server người dùng đang chạy nếu cần kiểm tra trực quan.

### Điều kiện đạt

- Không có side/backplane/void của About xuất hiện trong bất kỳ frame transition nào.
- Không có choreography chạy khi About không active hoặc đang flip.
- Hoán vị thể hiện thứ tự leader → follower → settle, không có block xuyên nhau hoặc nhảy layout tức thì.
- Một vòng lặp là 8 giây với 1.4 giây chuyển động và 6.6 giây đọc.
- Build và lint qua; reduced motion không có auto choreography.
