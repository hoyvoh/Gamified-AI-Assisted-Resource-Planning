Mình đã hoàn chỉnh lại bản coding standard theo hướng chặt hơn, dễ dùng cho team và cũng phù hợp để đưa cho agent/code reviewer đọc.

````md
# ReactJS & Next.js Coding Standard

Tài liệu này định nghĩa coding standard và coding policy cho frontend ReactJS/Next.js của dự án. Mục tiêu là giữ code **dễ đọc, dễ review, dễ test, dễ maintain**, nhất quán với **Next.js App Router**, **TypeScript**, **Tailwind CSS**, **TanStack Query** và các quy ước hiện có trong `ui/`.

---

## 1. Mục tiêu

Coding standard này được dùng để:

- Giữ codebase nhất quán giữa nhiều người phát triển hoặc AI agent.
- Giảm bug do style code không đồng bộ, boundary mơ hồ, type yếu.
- Giúp PR dễ review, dễ tách trách nhiệm, dễ rollback.
- Giữ UI/frontend code đúng với kiến trúc feature-first, App Router và domain boundary.
- Tạo nền tảng tốt cho test, scalability và refactor về sau.

---

## 2. Phạm vi áp dụng

Áp dụng cho toàn bộ frontend trong `ui/`, bao gồm:

- Next.js App Router trong `src/app`
- Shared UI components trong `src/components`
- Feature modules trong `src/features`
- Providers trong `src/providers`
- Shared utilities trong `src/lib`
- Domain/system modules trong `src/systems`
- Shared/generated types trong `src/types`
- Unit tests, component tests, Playwright/E2E tests nếu có

---

## 3. Tech baseline

Chuẩn này được viết cho stack:

- **React**
- **Next.js App Router**
- **TypeScript**
- **Tailwind CSS**
- **TanStack Query**
- **Zod** hoặc schema validation tương đương nếu có
- **Playwright** cho E2E / visual review nếu có
- **Vitest/Jest + Testing Library** cho unit/component test nếu có

Nếu dự án thêm công nghệ khác, quy tắc mới phải **phù hợp với các nguyên tắc ở đây**, không được làm giảm tính rõ ràng và maintainability của codebase.

---

## 4. Nguyên tắc chung

- Ưu tiên **code rõ ràng** hơn code “thông minh”.
- Ưu tiên **consistency** hơn style cá nhân.
- Không tối ưu sớm nếu chưa có bằng chứng về bottleneck.
- Tách logic theo **domain/feature**, không gom tất cả vào shared layer.
- Component nên nhỏ, trách nhiệm rõ, dễ scan, dễ test.
- Không tạo abstraction chỉ để tránh lặp vài dòng; chỉ tách khi abstraction thực sự giảm complexity hoặc tăng reuse hợp lý.
- Không để UI phụ thuộc trực tiếp vào response shape thô nếu response đó cần normalize.
- Không dùng `any` trừ khi có lý do thực sự rõ ràng, và phải có comment ngắn giải thích.
- Không merge code còn warning TypeScript, lint error, debug log, dead code hoặc TODO mơ hồ.
- Khi đứng giữa hai lựa chọn, chọn cách mà **reviewer mới vào dự án vẫn hiểu nhanh hơn**.

---

## 5. Tooling bắt buộc

Chạy trong thư mục `ui/`:

```bash
pnpm format
pnpm lint
pnpm type-check
pnpm test:unit:run
pnpm build
```
````

### Quy định

- Mọi PR phải pass ít nhất các command liên quan đến phần bị thay đổi.
- Với thay đổi UI đáng kể, bắt buộc có **screenshot** hoặc **video ngắn**.
- Với flow phức tạp hoặc animation/3D, phải tự review bằng browser hoặc Playwright trước khi merge.
- Không được bỏ qua lint/type-check để “merge nhanh”.

---

## 6. Cấu trúc thư mục

```text
ui/src/
  app/          # Next.js routes, layouts, pages, loading/error boundaries
  components/   # Shared reusable components
  features/     # Feature-oriented modules
  lib/          # Shared utilities, API clients, helpers
  providers/    # App-level providers
  systems/      # Domain systems, complex UI/3D/runtime subsystems
  test/         # Test setup and shared test utilities
  types/        # Shared/generated types
```

### Policy

- Code chỉ dùng cho **một feature** nên đặt trong `src/features/<feature-name>/`.
- Component chỉ đưa vào `src/components/` khi được dùng lại ở **nhiều feature** hoặc là primitive/layout shared.
- Utility chỉ dùng một nơi thì để gần nơi sử dụng; không đẩy lên `src/lib` quá sớm.
- Không import ngược xuyên feature nếu không có public boundary rõ ràng.
- Không tạo thư mục `utils`, `helpers`, `common`, `misc` quá chung chung nếu chưa rõ domain.
- Ưu tiên **feature-first**, sau đó mới đến shared extraction.

### Gợi ý cấu trúc feature

```text
src/features/resource-profile/
  components/
  hooks/
  api/
  mappers/
  types/
  utils/
  index.ts
```

---

## 7. Module boundary và import rule

### Nguyên tắc

- Import theo hướng **từ specific lên general**, không import lòng vòng.
- Feature A không được import trực tiếp internals của Feature B nếu chưa expose qua public API.
- Không để component shared import ngược vào feature-specific module.
- Không dùng relative path quá sâu kiểu `../../../../`; ưu tiên alias nếu dự án hỗ trợ.

### Ưu tiên import theo nhóm

1. External packages
2. Internal aliases / app modules
3. Relative imports cùng feature
4. Styles / assets nếu có

### Ví dụ

```ts
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { getResourceProfile } from "@/features/resource-profile/api/get-resource-profile";

import { formatScore } from "../utils/format-score";
```

### Không nên

```ts
import { formatScore } from "../utils/format-score";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
```

---

## 8. Naming convention

| Loại                   | Quy ước                                           | Ví dụ                                    |
| ---------------------- | ------------------------------------------------- | ---------------------------------------- |
| Component              | `PascalCase`                                      | `ResourceCard.tsx`                       |
| Hook                   | `use` prefix                                      | `useResourceProfile.ts`                  |
| Utility function       | `camelCase`                                       | `formatScore.ts`                         |
| Type/Interface         | `PascalCase`                                      | `ResourceProfile`                        |
| Constant               | `UPPER_SNAKE_CASE` hoặc `camelCase` theo ngữ cảnh | `MAX_SCORE`, `defaultFilters`            |
| Boolean variable       | `is/has/can/should` prefix                        | `isLoading`, `hasError`                  |
| Route file             | Next.js convention                                | `page.tsx`, `layout.tsx`, `loading.tsx`  |
| Test file              | colocated hoặc test folder                        | `resource-card.test.tsx`                 |
| Query key factory      | descriptive + stable                              | `resourceProfileQueryKey`                |
| Server action / API fn | verb first                                        | `getResourceProfile`, `updateMemberRole` |

### Quy định

- Không dịch identifier, API name, library name hoặc domain field từ backend.
- Tên phải mô tả ý nghĩa, không đặt tên chung chung kiểu `data`, `item`, `handleStuff`, `temp`.
- Tránh viết tắt khó hiểu. Chỉ dùng viết tắt phổ biến, ví dụ: `id`, `url`, `api`.
- Boolean phải trả lời được câu hỏi true/false một cách tự nhiên.

---

## 9. TypeScript policy

### Nguyên tắc

- Tư duy strict: mọi prop, API response, state object phải có type rõ.
- Ưu tiên `type` cho object shape đơn giản; dùng `interface` khi cần extend/public contract dài hạn.
- Không dùng `any`; ưu tiên `unknown` rồi narrow bằng guard/schema.
- Không ép kiểu bằng `as` nếu có thể model type đúng từ đầu.
- Không tạo enum runtime nếu union type là đủ.
- Không reuse bừa component props làm API model.
- Boundary với backend phải có type riêng.
- Với dữ liệu không đáng tin cậy từ API/URL/localStorage, nên parse hoặc validate trước khi dùng.

### Ví dụ

```ts
type ScoreLevel = "low" | "medium" | "high";

type ResourceSummaryProps = {
  name: string;
  score: number;
  level: ScoreLevel;
};
```

### Ưu tiên

- Dùng discriminated union cho state phức tạp.
- Dùng utility types có chủ đích (`Pick`, `Omit`, `Partial`) nhưng không lạm dụng khiến khó đọc.
- Với schema nhận từ API, ưu tiên mapper/validator thay vì để component tự đoán shape.

### Không nên

```ts
const data = response as any;
```

### Nên

```ts
type ResourceApiResponse = {
  id: string;
  name: string;
  score: number | null;
};

function mapResourceResponse(response: ResourceApiResponse) {
  return {
    id: response.id,
    name: response.name,
    score: response.score ?? 0,
  };
}
```

---

## 10. React component standard

### Thứ tự trong file component

1. Imports
2. Local types/constants
3. Main component
4. Helper nhỏ chỉ phục vụ component
5. Export phụ nếu thực sự cần

### Policy

- Component render UI nên nhận props đã được normalize càng nhiều càng tốt.
- Không fetch data trực tiếp trong deeply nested presentational component.
- Không mutate props hoặc object state.
- Không đặt business logic phức tạp trong JSX.
- Không inline function quá lớn trong JSX.
- Không dùng array index làm `key` nếu list có ID ổn định.
- Tách component khi JSX khó scan hoặc có state/interaction riêng.
- Một component không nên vừa fetch data, vừa map data, vừa xử lý business logic, vừa render quá nhiều trạng thái lớn.

### Khi nào nên tách component

- JSX dài, phải scroll nhiều mới đọc hết.
- Có block UI lặp lại.
- Có state/interaction riêng biệt.
- Có thể test độc lập.
- Có thể reuse ở route/view khác.

### Ví dụ

```tsx
type ResourceCardProps = {
  resourceId: string;
  name: string;
  score: number;
  onOpen: (resourceId: string) => void;
};

export function ResourceCard({
  resourceId,
  name,
  score,
  onOpen,
}: ResourceCardProps) {
  return (
    <button type="button" onClick={() => onOpen(resourceId)}>
      <span>{name}</span>
      <span>{score}</span>
    </button>
  );
}
```

---

## 11. Props design

### Quy tắc

- Props phải rõ nghĩa, không nhồi quá nhiều field không liên quan.
- Ưu tiên primitive props hoặc view-model đã normalize thay vì truyền raw object quá to.
- Callback props nên đặt tên theo hành động: `onOpen`, `onSelect`, `onSubmit`.
- Không truyền cả object lớn nếu component chỉ dùng 2–3 field.
- Không truyền props để “phòng hờ” tương lai.

### Không nên

```tsx
<ResourceCard resource={rawApiResponse} />
```

### Nên

```tsx
<ResourceCard
  resourceId={resource.id}
  name={resource.name}
  score={resource.score}
/>
```

---

## 12. Hooks standard

### Quy tắc

- Custom hook dùng khi logic state/effect/query được reuse hoặc giúp component gọn hơn.
- Hook phải có tên bắt đầu bằng `use`.
- Hook chỉ nên giải quyết **một nhóm trách nhiệm rõ ràng**.
- Không tạo custom hook chỉ để bọc lại 2 dòng code không tăng clarity.
- Hook không nên trả về object quá mơ hồ kiểu `{ data, state, doStuff }`.

### Ưu tiên return shape rõ ràng

```ts
type UseResourceProfileResult = {
  profile: ResourceProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};
```

### Không nên

- Hook vừa fetch data, vừa điều khiển modal, vừa gắn event listener unrelated.
- Hook trả về quá nhiều giá trị làm component khó đọc.

---

## 13. Server Components và Client Components

### Default

Dùng **Server Component** nếu component **không cần**:

- browser API
- event handler
- local client state
- React Query hooks
- animation runtime
- 3D/runtime library

### Dùng `"use client"` khi cần

- `useState`, `useEffect`, `useMemo`, `useCallback`
- Browser API như `window`, `document`, `localStorage`
- Event handler như `onClick`, `onChange`
- TanStack Query hooks
- Animation/interaction runtime như GSAP, Three.js, React Three Fiber

### Policy

- Đặt `"use client"` ở file nhỏ nhất có thể.
- Không biến cả page/layout thành Client Component nếu chỉ một vùng nhỏ cần interactivity.
- Server Component có thể truyền data đã serialize xuống Client Component qua props.
- Không truyền function từ Server Component xuống Client Component.
- Với component nặng về animation/3D, cần tách boundary rõ để route không bị client hóa quá rộng.

---

## 14. Next.js App Router policy

### Quy tắc

- Route-level files phải theo convention của Next.js:
  - `page.tsx`
  - `layout.tsx`
  - `loading.tsx`
  - `error.tsx`
  - `not-found.tsx`

- Page component chịu trách nhiệm composition, không chứa quá nhiều UI detail.
- Dùng `loading.tsx` cho route có data load đáng kể.
- Dùng `error.tsx` cho route có khả năng fail ở runtime.
- Metadata nên đặt ở route/layout phù hợp, không hard-code rải rác.
- Không dùng Pages Router pattern trong App Router code.
- Không đặt business logic lớn trong `page.tsx` nếu có thể chuyển vào feature module.

### Gợi ý

- `app/.../page.tsx`: composition
- `features/.../api`: fetcher
- `features/.../components`: view
- `features/.../hooks`: state/query
- `features/.../mappers`: normalize API data

---

## 15. Data fetching và API integration

### Policy

- Tất cả request tới backend phải đi qua API client/helper có type rõ.
- Không gọi `fetch` rải rác trong component nếu endpoint được dùng lại.
- Normalize data ở boundary gần API.
- Error state, loading state, empty state phải được thiết kế rõ.
- Với TanStack Query, query key phải ổn định, có namespace, có factory nếu cần.
- Không refetch bằng side effect thủ công nếu TanStack Query đã xử lý được.
- Không để component tự xử lý nhiều response shape khác nhau từ cùng một endpoint.

### Query key example

```ts
export const resourceProfileQueryKey = (resourceId: string) =>
  ["resource-profile", resourceId] as const;
```

### API layer example

```ts
type ResourceProfileResponse = {
  id: string;
  display_name: string;
  score: number | null;
};

type ResourceProfile = {
  id: string;
  name: string;
  score: number;
};

export async function getResourceProfile(
  resourceId: string,
): Promise<ResourceProfile> {
  const response = await fetch(`/api/resources/${resourceId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch resource profile");
  }

  const data: ResourceProfileResponse = await response.json();

  return {
    id: data.id,
    name: data.display_name,
    score: data.score ?? 0,
  };
}
```

### Không nên

- Dùng raw `fetch(...).then(...).then(...)` rải rác trong nhiều component.
- Map field API trong JSX.
- Trộn cả normalize + render + side effects vào cùng một component.

---

## 16. State management

### Thứ tự ưu tiên

1. **Local component state** cho UI state nhỏ
2. **URL state** cho state cần share/bookmark/back-forward
3. **TanStack Query** cho server state
4. **Context** cho app-level state ổn định
5. **External store** chỉ khi có nhu cầu rõ ràng

### Policy

- Không copy server state vào local state nếu không cần edit draft.
- Không lưu derived state nếu có thể tính từ source state.
- URL state không nên chứa transient hover/focus state.
- Context không dùng làm nơi chứa mọi thứ.
- Không biến global state thành default choice.
- State phải có owner rõ ràng.

### Không nên

```ts
const [profile, setProfile] = useState(query.data);
```

trừ khi đang làm editable draft hoặc có lý do rõ ràng.

---

## 17. Form handling

### Quy tắc

- Form state phải có schema hoặc validation rule rõ ràng nếu dữ liệu quan trọng.
- Error message phải cụ thể, gắn với field hoặc action tương ứng.
- Disabled/loading/submitting state phải rõ.
- Không để submit nhiều lần ngoài ý muốn.
- Giá trị mặc định phải được xác định rõ, không để uncontrolled/controlled lẫn lộn.

### Nên

- Tách validation logic khỏi JSX.
- Parse/sanitize input ở boundary phù hợp.
- Với form lớn, nên có layer schema riêng.

---

## 18. Styling và UI standard

### Policy

- Ưu tiên Tailwind utility theo pattern hiện có.
- Dùng `clsx`, `tailwind-merge`, hoặc helper local khi className có điều kiện phức tạp.
- Không hard-code magic spacing/color nếu dự án đã có token, semantic class hoặc pattern tương đương.
- Button/icon/action phải có trạng thái hover, focus, disabled phù hợp.
- Text không được overflow khỏi button/card/container ở mobile.
- Không để layout shift khi hover, loading, hoặc data thay đổi.
- Không lồng card trong card nếu không có lý do UI rõ ràng.
- UI phải có empty/loading/error state tương ứng với workflow thực tế.
- Ưu tiên hierarchy rõ: title, supporting text, actions, meta.

### Quy tắc bổ sung

- Không nhồi quá nhiều text trong một vùng nhỏ.
- Không dùng quá nhiều màu cạnh tranh nhau trong cùng một screen.
- Spacing phải theo nhịp nhất quán.
- Kích thước chữ phải có hierarchy rõ, không “to đều”.
- Skeleton/loading placeholder nên gần với layout thật để tránh jump mạnh.

---

## 19. Responsive design

### Quy tắc

- Mọi UI mới phải xem được ở mobile và desktop nếu route đó hỗ trợ cả hai.
- Không được để text, badge, button, table overflow ngoài viewport.
- Không phụ thuộc vào hover-only interaction cho flow chính.
- Sidebar/panel dài phải có chiến lược collapse, sticky hoặc reflow rõ ràng.
- Layout phức tạp cần kiểm tra ở ít nhất:
  - mobile nhỏ
  - tablet
  - desktop phổ biến

### Minimum expectation

- Không vỡ layout
- Không mất action chính
- Không bị che nội dung quan trọng
- Không bị chữ chồng lên nhau

---

## 20. Accessibility policy

### Quy tắc

- Interactive element phải dùng semantic element trước: `button`, `a`, `input`, `select`.
- Icon-only button phải có `aria-label`.
- Không dùng `div`/`span` có `onClick` thay cho button nếu không có keyboard handling đầy đủ.
- Focus state phải nhìn thấy được.
- Modal/drawer/popover phải quản lý focus và close behavior hợp lý.
- Color không được là tín hiệu duy nhất cho trạng thái.
- Form field phải có label hoặc accessible name.
- Ảnh mang ý nghĩa nội dung phải có `alt` phù hợp.
- Skeleton/spinner nên có text hoặc semantics hợp lý khi cần.

### Không nên

```tsx
<div onClick={handleOpen}>Open</div>
```

### Nên

```tsx
<button type="button" onClick={handleOpen}>
  Open
</button>
```

---

## 21. Performance policy

### Quy tắc

- Không dùng `useMemo`/`useCallback` đại trà; chỉ dùng khi có tác dụng thực tế.
- Tránh tạo object/array lớn trong render nếu gây rerender tốn kém.
- Tách component nặng khỏi vùng state thay đổi liên tục.
- Dynamic import cho module nặng chỉ dùng ở một số flow.
- Với chart/3D/animation, phải kiểm tra render thực tế trên desktop và mobile.
- Không load asset lớn nếu không cần trong first viewport.
- Không render list rất dài mà không có virtualization/pagination khi cần.
- Với animation, ưu tiên mượt và ổn định hơn “phô diễn” quá mức.

### Dấu hiệu cần xem lại performance

- Rerender lan rộng
- Hydration nặng
- Scroll lag
- Animation giật
- Bundle route quá lớn
- Hình ảnh/asset tải chậm không cần thiết

---

## 22. Security policy

### Quy tắc

- Không render HTML thô bằng `dangerouslySetInnerHTML` nếu chưa sanitize và chưa review.
- Không log token, secret, session hoặc dữ liệu nhạy cảm.
- Không trust dữ liệu từ URL/search params; luôn validate/narrow.
- Không đưa secret vào frontend env. Chỉ biến `NEXT_PUBLIC_*` mới xuất hiện ở client.
- External link mở tab mới phải dùng `rel="noreferrer"` khi phù hợp.
- User-generated text phải render như text, không như HTML.
- Không nhét logic auth nhạy cảm chỉ ở client nếu backend mới là source of truth.

---

## 23. Environment variable policy

### Quy tắc

- Client chỉ được dùng biến `NEXT_PUBLIC_*`.
- Server-only secret không được import vào Client Component.
- Không hard-code endpoint, token, project id nếu đã có env config.
- Phải có fallback/error message rõ nếu env bắt buộc bị thiếu ở runtime/build time.

### Không nên

```ts
const API_KEY = "hard-coded-secret";
```

---

## 24. Error handling

### Quy tắc

- Error message cho user phải rõ hành động tiếp theo, không dump stack trace.
- Developer detail có thể log ở dev mode, nhưng không để console noise trong production flow.
- API error nên được map thành state có ý nghĩa:
  - unauthorized
  - forbidden
  - not found
  - validation error
  - server error

- Không swallow error im lặng trong async function.
- Route-level failure nên có `error.tsx` hoặc fallback hợp lý.
- Empty state và error state không được giống nhau.

### Không nên

```ts
try {
  await saveData();
} catch (error) {}
```

### Nên

```ts
try {
  await saveData();
} catch (error) {
  reportError(error);
  setSubmitError("Unable to save changes. Please try again.");
}
```

---

## 25. Logging và debug policy

### Quy tắc

- Không để `console.log`, `console.debug` hoặc debug marker tồn tại trong PR production.
- Logger nếu có phải được dùng có chủ đích.
- Temporary log phục vụ debug phải xóa trước khi merge.
- Không để comment kiểu `FIXME later`, `temp`, `hack` mà không có context cụ thể.

---

## 26. Comments và documentation

### Nguyên tắc

- Comment để giải thích **vì sao**, không lặp lại **code đang làm gì**.
- Chỉ comment khi logic không tự hiển nhiên.
- Không comment kiểu noise.
- Public helper hoặc hàm phức tạp nên có mô tả ngắn nếu cần.

### Không nên

```ts
// increment i
i++;
```

### Nên

```ts
// Keep the previous tab visible during refetch to avoid layout jump.
```

---

## 27. Testing policy

### Viết test khi

- Logic normalize/transform data có nhiều nhánh
- Component có interaction quan trọng
- Bug đã từng xảy ra và có thể regression
- Hook có behavior phụ thuộc async/cache/state
- Route hoặc workflow có business impact cao

### Ưu tiên

- Unit test cho pure function, mapper, hook logic
- Component test cho UI state quan trọng
- Playwright/E2E cho user journey, visual flow, route interaction

### Quy tắc

- Không snapshot toàn bộ UI lớn nếu snapshot khó review và dễ nhiễu.
- Test phải mô tả behavior, không gắn quá chặt với implementation detail.
- Bug fix nên đi kèm test nếu bug có khả năng tái diễn.
- Nếu không viết test cho thay đổi có rủi ro, PR phải nêu rõ lý do.

---

## 28. UI review policy

Áp dụng cho các PR có thay đổi giao diện, animation, layout, UX flow.

### Bắt buộc kiểm tra

- desktop
- mobile
- loading state
- empty state
- error state
- hover/focus/disabled states
- text overflow
- scroll behavior
- dark/light theme nếu dự án hỗ trợ
- animation entry/exit nếu có

### Với screen phức tạp

Cần review thêm:

- hierarchy có rõ không
- action chính có nổi bật không
- panel/sidebar có quá dài không
- text có bị dày đặc quá không
- màu sắc có đồng đều không
- có khu vực nào bị “ồn”, khó focus không

---

## 29. File size và complexity guideline

Không có hard limit tuyệt đối, nhưng cần xem lại khi:

- Component file quá dài và khó scan
- Một file chứa nhiều responsibility khác nhau
- Một hook xử lý quá nhiều concern
- JSX quá sâu nhiều tầng
- Một PR vừa refactor lớn vừa sửa feature

### Dấu hiệu nên refactor

- Có nhiều section comment kiểu `// section`
- Phải scroll quá nhiều để hiểu một component
- Có nhiều branch logic khó theo dõi
- Reuse logic bằng copy-paste bắt đầu xuất hiện

---

## 30. Code review checklist

Trước khi merge, reviewer kiểm tra:

### Architecture

- Code có đúng feature boundary không?
- Shared extraction có hợp lý không?
- Có import ngược hoặc coupling không cần thiết không?

### Readability

- Component có quá nhiều trách nhiệm không?
- Tên biến/hàm/type có rõ nghĩa không?
- JSX có dễ scan không?

### Type safety

- Có dùng `any` hoặc ép kiểu che lỗi không?
- Boundary API có type rõ không?
- Có validate dữ liệu không đáng tin cậy không?

### UX/UI

- Loading/empty/error states đã đủ chưa?
- Accessibility cơ bản đã ổn chưa?
- UI có responsive, không overflow, không vỡ layout không?
- Hierarchy và spacing có ổn không?

### Data / state

- Query key có ổn định không?
- Có copy server state sang local state vô lý không?
- Derived state có bị lưu thừa không?

### Quality

- Test có tương xứng với rủi ro thay đổi không?
- `pnpm lint`, `pnpm type-check`, test/build cần thiết đã pass chưa?
- Có debug log, dead code, TODO mơ hồ không?

---

## 31. Definition of Done

Một frontend task được coi là hoàn tất khi:

- Behavior đúng acceptance criteria
- Code được đặt đúng module và đúng naming convention
- TypeScript không có lỗi
- Lint/format pass
- Test phù hợp đã được thêm/chạy nếu thay đổi có rủi ro
- UI được kiểm tra ở viewport phù hợp nếu có thay đổi giao diện
- Không còn debug log, dead code, TODO mơ hồ
- Documentation/changelog được cập nhật nếu task yêu cầu hoặc thay đổi đáng kể
- Reviewer có thể hiểu lý do thay đổi mà không phải đoán quá nhiều

---

## 32. PR policy

### PR nên có

- Summary ngắn về thay đổi
- Screenshots hoặc video ngắn nếu thay đổi UI
- Test evidence: command đã chạy và kết quả
- Risk note / rollback note nếu thay đổi ảnh hưởng workflow chính
- Ghi chú nếu có intentional trade-off

### PR không nên chứa

- Refactor không liên quan
- Format churn trên file không cần thiết
- Dead code/comment cũ
- Thay đổi API contract mà không cập nhật type/docs
- Một đống thay đổi nhỏ không liên quan gộp chung khiến khó review

### Quy tắc PR tốt

- Scope vừa đủ
- Commit/description dễ hiểu
- Có thể review theo từng concern
- Có đường rollback rõ nếu cần

---

## 33. Những điều bị cấm hoặc hạn chế mạnh

- Dùng `any` không lý do
- Ép kiểu để “qua type-check”
- Client hóa cả route khi chỉ một phần nhỏ cần interactive
- Fetch API rải rác trong nhiều component presentation
- Để raw backend shape tràn vào toàn bộ UI
- Dùng index làm key cho list động
- Để debug log trong code production
- Dùng `div` thay `button` cho action click
- Hard-code magic values tràn lan khi đã có design token/pattern
- Gộp refactor unrelated vào PR feature
- Merge khi chưa tự kiểm tra loading/error/empty state

---

## 34. Recommended patterns

### Nên dùng

- Feature-first structure
- Query key factory
- API mapper / normalizer
- Small presentational components
- Thin route composition
- Clear loading/error/empty UI
- Semantic HTML
- Stable types at boundaries
- Co-located tests cho logic quan trọng

### Chỉ dùng khi cần

- Context lớn
- External state store
- Heavy abstraction
- Generic component quá sớm
- Memoization tràn lan
- Dynamic import everywhere

---

## 35. Ví dụ định hướng tổ chức code

```text
src/features/member-profile/
  api/
    get-member-profile.ts
  components/
    member-profile-card.tsx
    member-profile-stats.tsx
  hooks/
    use-member-profile.ts
  mappers/
    map-member-profile.ts
  types/
    member-profile.ts
  index.ts
```

```ts
// api/get-member-profile.ts
export async function getMemberProfile(memberId: string): Promise<MemberProfile> {
  ...
}
```

```ts
// hooks/use-member-profile.ts
export function useMemberProfile(memberId: string) {
  return useQuery({
    queryKey: memberProfileQueryKey(memberId),
    queryFn: () => getMemberProfile(memberId),
  });
}
```

```tsx
// components/member-profile-card.tsx
type MemberProfileCardProps = {
  name: string;
  role: string;
  score: number;
};

export function MemberProfileCard({
  name,
  role,
  score,
}: MemberProfileCardProps) {
  ...
}
```

---

## 36. Tóm tắt tinh thần áp dụng

Frontend code tốt trong dự án này phải:

- rõ ràng
- typed tốt
- đúng boundary
- dễ review
- dễ test
- không over-engineered
- không phụ thuộc vào may mắn
- và không bắt reviewer phải đoán intent của người viết

Nếu code “chạy được” nhưng:

- khó đọc,
- khó sửa,
- khó test,
- hoặc sai boundary,

thì vẫn **chưa đạt standard**.

---

## 37. Rule ngắn gọn cho agent / reviewer

Nếu dùng cho AI agent review code, có thể rút gọn thành checklist sau:

- Ưu tiên clarity hơn cleverness
- Respect feature boundary
- Không dùng `any` nếu không có comment giải thích
- Không để raw API shape chảy thẳng vào UI nếu cần normalize
- Page chỉ nên compose, không ôm quá nhiều UI/business logic
- `"use client"` ở phạm vi nhỏ nhất có thể
- Query key phải stable
- Loading / empty / error states phải rõ
- Semantic HTML và accessibility cơ bản là bắt buộc
- Không để debug log, dead code, TODO mơ hồ
- PR không chứa refactor unrelated
- Mọi thay đổi UI phải được tự review ở viewport phù hợp

---

```

Nếu bạn muốn, ở bước tiếp theo mình có thể rút bản này thành **phiên bản ngắn gọn dành riêng cho AI agent review code** kiểu “must / should / anti-pattern” để nhét vào rule file dễ hơn.
```
