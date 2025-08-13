# @healthcare/shared

Thư viện dùng chung (types, Zod schemas, type guards, utils) cho monorepo.

## Cài đặt

Trong monorepo đã cấu hình Yarn Workspaces, chỉ cần import theo alias:

```ts
import { UserRoleSchema, isTokenPayload } from '@healthcare/shared';
```

## Build

```bash
yarn workspace @healthcare/shared build
```

## Exports

- `types`: kiểu dữ liệu dùng chung (UserRole, TokenPayload, ...)
- `schemas`: Zod schemas (Auth, UserRole, Token, Specialty, Doctor, ScheduleSlot, ...)
- `guards`: type guards kèm assert (isTokenPayload, assertTokenPayload, isUserRole, hasAnyRole)
- `utils`: helpers kiểm tra chuỗi/ngày giờ

## Lưu ý

- Tất cả guard đều dựa trên Zod để đảm bảo type-safety và narrowing chính xác.
