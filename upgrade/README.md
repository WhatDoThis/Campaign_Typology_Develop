# upgrade — LGU Typology 패키지

ACC Console Import용 upgrade 패키지. **두 모듈 + 공통(shared)** 로 분리.

---

## 구조

| 패키지 | 경로 | 용도 |
|--------|------|------|
| **typologySetup** | [typologySetup/](typologySetup/docs/00_README.md) | Delivery Prepare · Pressure scheduling 셋업 (완료 모듈) |
| **typologyUpgrade** | [typologyUpgrade/docs/README.md](typologyUpgrade/docs/README.md) | 피로도 CRUD · Rule sync UI |
| **shared** | [shared/README.md](shared/README.md) | 두 모듈 공통 — delivery 스키마 · 커스텀 채널 JS |

**default 이관:** OOTB 수정분은 [default/](../default/) (inputForm · schema · js).

---

## 구축 순서 (요약)

```
1. shared/schema — delivery · deliveryMapping Import
2. typologyUpgrade/schema — LGU_TARGET_TYPE_* · typologyRule Import
3. typologyUpgrade — fatigue form/navtree · sync JS
4. typologySetup — deliveryCustomMMS · Pressure Adapter Control rule
5. default — nms:delivery hasDeliveryContent 패치
```

상세: typologySetup [00_README](typologySetup/docs/00_README.md) · typologyUpgrade [packageRun](typologyUpgrade/docs/packageRun/00_Index.md)
