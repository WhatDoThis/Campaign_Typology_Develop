# Log

## Log Index

92. 2026-09-14 Test lguTest* archive 삭제 — Rank A 검증 후 Repo 정리
91. 2026-09-11 acc-reference-index LGU Rank A thresholdLink canonical (iter 1)
90. 2026-09-11 lguTestFixPressureRuleThresholdLink diag+repair JS
89. 2026-09-11 lguTestSeedCustomerMapping Console JS — Rank A data seed
88. 2026-09-11 recipient_uplus @CUST_ID_T + symmetric link join
87. 2026-09-11 LGU_CUSTOMER_MAPPING Rank A linked dimension schema
86. 2026-09-11 lguFatigueRuleSync repair/debug 제거 — 피로도 UI sync 본연 역할 복원
85. 2026-09-11 All rule filter explicit delete on insertOrUpdate
84. 2026-09-11 lguFatigueRuleSync verbose debug + repair periodDays fix
83. 2026-09-11 repairManagedPressureRuleShells folder-id — TYR manual rule 호환
82. 2026-09-11 repairManagedPressureRuleShells + thresholdLink @CUST_ID sync
81. 2026-09-11 lguTestEnsureDeliverySenderFromModel getModelId 제거 — queryDef model resolve
80. 2026-09-11 acc-reference-index thresholdLink·linked dimension·pressure mapping
79. 2026-09-11 loadRuleTypologyIds TYLgu scan+count — @typology-id queryDef 금지
78. 2026-09-11 loadRuleTypologyIds typologyRuleRel query — typology/@id XTK-170036
77. 2026-09-11 ValidateBeforeSave SOAP long/int 재발 수정
76. 2026-09-11 fatigue form preSave/preDelete 제거 — leave·navtree delete
75. 2026-09-11 form Edit cap/period enter fix + Typology Edit relink
74. 2026-09-11 fatigue preSave duplicate + preDelete Explorer TYR sync
73. 2026-09-11 typologyRule filter humanCond + timespan suffix ref table
72. 2026-09-11 periodRanking timespan seconds — fix BAS-010042 Pressure tab 7d
71. 2026-09-11 typologyRule queryDef folder — [folder/@id] not @folder-id in select
70. 2026-09-11 fix queryFirstRow @folder-id — nms:typology XTK-170036 on Save
69. 2026-09-11 typologyRule folder-id=0 Explorer 미표시 — contextType·repairTypologyRuleFolder
68. 2026-09-11 fatigue sync TYR — folder-id·typologies Write·link verify·diagFatigueSync
67. 2026-09-11 fatigue SOAP param int + Typology /tmp/@typologyName preview
66. 2026-09-11 fatigue Save fix — schema default TY·form leave·Typology setOnClick
65. 2026-09-10 fatigue postSave SyncFromForm SOAP — xtk:javascript 제거
64. 2026-09-10 fatigue schema messageType default 101 — New enum fix
63. 2026-09-10 fatigue form New/Edit — _isNewEntity (notebook applicableIf 제거)
62. 2026-09-10 fatigue form expression fix — [@id]·targetPickAll byte
61. 2026-09-10 fatigue form Typology picker — where→sysFilter
60. 2026-09-10 fatigue JS cleanup — legacy·one-off WF 제거
59. 2026-09-10 fatigue form UI + RLLgu/TYLgu naming refactor
58. 2026-09-10 fatigue schema messageType enum — lgu:delivery template
57. 2026-09-10 fatigue form 줄바꿈 손상 복구 — 214→107 lines
56. 2026-09-10 fatigue form preDelete 제거 — DeleteWithRuleSync 버튼
55. 2026-09-10 fatigue form CRUD — New/Delete Rule auto sync
54. 2026-09-10 lguFatigueRuleSync lastSyncAt formatDate fix
53. 2026-09-10 lguFatigueRuleSync common.js 제거 — WF seed 호환
52. 2026-09-10 Console JS 삭제 이력 정리 — lguTest* archive
51. 2026-09-10 upgrade 패키지 분리 — typologySetup · typologyUpgrade · shared
50. 2026-09-10 lguTypologyPressureAdapter — rename from lguEnsureDeliveryScheduling
49. 2026-09-10 lguEnsureDeliveryScheduling — Pressure용 contactDate materialize only
48. 2026-09-10 TEST 부록 JS 분리 — content mirror·scheduling materialize
47. 2026-09-10 lguEnsureDeliveryScheduling scope — expr+tz only
46. 2026-09-09 typology postTarget PrepareMessage 롤백 — wkDlv 손상
45. 2026-09-09 PrepareMessageImpl — typology static type fix
44. 2026-09-09 postTarget toDeliver=0 skip 제거 — live resolve
43. 2026-09-09 live scheduling node fix — No contact date arbitration
42. 2026-09-09 GitHub 초기 push — Campaign_Typology_Develop
41. 2026-09-09 acc-reference-index PrepareMessage·postTarget·count delta
40. 2026-09-09 postTarget ensureDeliveryPrepareMessageForTypology — WF js6 대체
39. 2026-09-09 lguTestRunDeliveryPrepareMessage — STG 제외·load fix
38. 2026-09-09 JS codes 정리 — lguTest* 네이밍·중복 삭제
37. 2026-09-09 lguRunDeliveryPrepareMessage WF 후속 스크립트
36. 2026-09-09 lguMMS PrepareMessage content/sms mirror
35. 2026-09-09 hasDeliveryContent main enter + Prepare targetReady 진단
34. 2026-09-09 lguEnsureDeliveryScheduling scheduling-only + live patch
33. 2026-09-09 patchScheduling formatDate — typology NL.XTK undefined
32. 2026-09-09 patchScheduling contactDate ISO8601 (TIM-030009)
31. 2026-09-09 MSG template 복사 롤백 — delivery UI SENDER 흐름 정정
30. 2026-09-09 Prepare MSG+SENDER 복사 + contactDate materialize
29. 2026-09-09 validate_delivery_prepare_diag getIfExists 루트 접근 수정
28. 2026-09-09 validate_delivery_prepare_diag @toSend 제거
27. 2026-09-09 validate_delivery_prepare_diag mapping/@id xpath 수정
26. 2026-09-09 validate_delivery_prepare_diag.js — WF queryDef-only 진단
25. 2026-09-09 deliveryMapping lguMMS inline hook — lib form 제거
24. 2026-09-09 uplus:deliveryMapping 복구 SSOT + lgu schema 롤백
23. 2026-09-09 deliveryMapping_lgu schema XML-110013 대응
22. 2026-09-09 deliveryMapping_nms.xml 제거 — ref 위치 주석으로 대체
21. 2026-09-09 deliveryMapping form extend 패턴 수정 (default OOTB 복원)
20. 2026-09-09 lgu:deliveryMapping lguMMS 주소 매핑 확장
19. 2026-09-09 nms:delivery hasDeliveryContent lguMMS 패치
18. 2026-09-09 Control rule return true + SSOT DM473 lookup
17. 2026-09-09 lguEnsureDeliveryScheduling SSOT lookup by deliveryCode
16. 2026-09-09 acc-reference-validator dual-algorithm + reference index
15. 2026-09-09 lguEnsureDeliveryScheduling model-id → deliveryModel-id xpath 수정
14. 2026-09-09 lguEnsureDeliveryScheduling Console 구버전 재Import 안내 + delivery.id
13. 2026-09-09 lguEnsureDeliveryScheduling E4X object literal 컴파일 오류 수정
12. 2026-09-09 ACC JS codes Internal name .js 접미사 규칙 문서화
11. 2026-09-09 deliveryCustomMMS enum 참조 수정 (XSV-350000)
10. 2026-09-09 Prepare lib 분리 — 공통 scheduling/target + TEST SENDER 부록
9. 2026-09-09 lguEnsureDeliveryScheduling 줄바꿈 복구 + ACC R13 검증 규칙
8. 2026-09-09 SENDER Save fix + Prepare auto-patch (target/content/scheduling)
7. 2026-09-09 lguEnsureDeliveryScheduling Control typology rule
6. 2026-09-08 nms:delivery form — lgu_off_inbound_shop EV hook 제거
5. 2026-09-08 delivery schema 분리·중복 정리 (delivery_lgu / delivery_uplus)
4. 2026-09-08 lgu:delivery schema — LGU_SUCCESS_METRIC_M_NO 명명 통일
3. 2026-09-08 SMS/MMS 피로도 Rule 2행 (RLSmsMmsAll/Type2) 반영
2. 2026-09-08 LGU_TARGET_TYPE_FATIGUE_M 피로도 관리 스키마 및 typologyUpgrade 전면 재구성
1. 2026-09-08 Ver.2 LGU_TARGET_TYPE_M_NO 필드 통일 및 배포 문서

## Log Body

91. 2026-09-11 acc-reference-index LGU Rank A thresholdLink canonical (iter 1)

Purpose: Agent 1 dual-algorithm — Test v7 9396 incident thresholdLink canonical value 및 invalid variants index화

Changes:

- Index lookup: LGU Rank A canonical `LGU_CUSTOMER_MAPPING`; invalid @CUST_ID_T / link/@attr / UI label
- Project-local: recipient_uplus, LGU_CUSTOMER_MAPPING (Test fix JS는 §92에서 Repo 삭제)

Changed files: .cursor/skills/acc-reference-validator/acc-reference-index.md, docs/log/log.md

92. 2026-09-14 Test lguTest* archive 삭제 — Rank A 검증 후 Repo 정리

Purpose: Campaign configuration 외 일회성 Test JS·seed·diag 제거

Changes:

- typologySetup/js/_archive/test/ 전체 삭제 (11 files)
- 04_Console_JS_Cleanup §4-6, 01_DataModel §1-6, acc-reference-index·acc-patterns 갱신

Changed files: upgrade/typologySetup/js/_archive/test/* (deleted), upgrade/typologySetup/docs/04_Console_JS_Cleanup.md, upgrade/typologySetup/README.md, upgrade/typologyUpgrade/docs/upgradePlan/01_DataModel.md, .cursor/skills/acc-reference-validator/acc-reference-index.md, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md, .cursor/rules/adobe-acc-orchestrator.mdc, docs/log/log.md

90. 2026-09-11 lguTestFixPressureRuleThresholdLink diag+repair JS

Purpose: thresholdLink invalid path (@CUST_ID_T, link/@attr) 진단 및 LGU_CUSTOMER_MAPPING link name Write

Changes:

- lguTestDiagPressureRuleThresholdLink / lguTestFixPressureRuleThresholdLink

Changed files: upgrade/typologySetup/js/_archive/test/lguTestFixPressureRuleThresholdLink.js, docs/log/log.md

89. 2026-09-11 lguTestSeedCustomerMapping Console JS — Rank A data seed

Purpose: raw SQL 대신 ACC queryDef+Write로 CUST_ID_T backfill 및 LGU_CUSTOMER_MAPPING upsert

Changes:

- lguTestBackfillRecipientCustIdT / lguTestSeedLguCustomerMapping / lguTestSeedCustomerMappingAll

Changed files: upgrade/typologySetup/js/_archive/test/lguTestSeedCustomerMapping.js, docs/log/log.md

88. 2026-09-11 recipient_uplus @CUST_ID_T + symmetric link join

Purpose: Rank A link join 양쪽 @CUST_ID_T 정렬 (mapping 스키마와 동일 필드명)

Changes:

- recipient_uplus: @CUST_ID_T attribute 추가 (label 고객번호 TEST)
- LGU_CUSTOMER_MAPPING link join xpath-src/dst 모두 @CUST_ID_T

Changed files: default/schema/recipient_uplus.xml, upgrade/shared/schema/LGU_CUSTOMER_MAPPING.xml, docs/log/log.md

87. 2026-09-11 LGU_CUSTOMER_MAPPING Rank A linked dimension schema

Purpose: Pressure thresholdLink Rank A — Adobe linked dimension 패턴 (customer mapping table + recipient link)

Changes:

- lgu:LGU_CUSTOMER_MAPPING schema (@CUST_ID_T PK)
- uplus:recipient link LGU_CUSTOMER_MAPPING (join @CUST_ID → @CUST_ID_T)
- lguFatigueRuleSync thresholdLink → LGU_CUSTOMER_MAPPING
- pressureRule templates thresholdLink 갱신

Changed files: upgrade/shared/schema/LGU_CUSTOMER_MAPPING.xml, default/schema/recipient_uplus.xml, upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, upgrade/typologyUpgrade/js/templates/pressureRule_*.xml, upgrade/shared/README.md, docs/log/log.md

86. 2026-09-11 lguFatigueRuleSync repair/debug 제거 — 피로도 UI sync 본연 역할 복원

Purpose: repairManagedPressureRuleShells·dbg·_operation=delete hack 제거 — TYR Rule은 OOTB UI/fatigue UI로 관리

Changes:

- repairManagedPressureRuleShells, lguFatigueDbg*, filter delete marker 삭제
- buildPressureRuleXml(row) 단일 시그니처 복원; thresholdLink=@CUST_ID 유지

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, docs/log/log.md

85. 2026-09-11 All rule filter explicit delete on insertOrUpdate

Purpose: RLLguSmsMmsAll repair 후에도 TYR empty filter shell 잔존 방지 (XTK-170036)

Changes:

- buildPressureRuleXml All(typeNo=0): contextFilter/deliveryFilter _operation=delete
- lguFatigueXmlHasRealChild: dbg summary E4X false positive 제거

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, docs/log/log.md

84. 2026-09-11 lguFatigueRuleSync verbose debug + repair periodDays fix

Purpose: WKF234/js3 SCR-160012 — repair 실행 단계 journal 추적 + periodDays 누락 throw 수정

Changes:

- lguFatigueDbg / lguFatigueDbgRuleXmlSummary / lguFatigueDbgFolderSources 추가
- repairManagedPressureRuleShells: step별 로그, rule별 try/catch, verifyAfterWrite
- buildPressureRuleXml / writeRule / buildPeriodRankingTimespan 디버그 로그
- repair spec에 periodDays=7 추가 (buildPeriodRankingTimespan 필수)

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, docs/log/log.md

83. 2026-09-11 repairManagedPressureRuleShells folder-id — TYR manual rule 호환

Purpose: WKF234/js3 SCR-160012 — repair 시 buildPressureRuleXml folder throw 방지

Changes:

- buildPressureRuleXml(row, folderIdOverride): optional folder
- repairManagedPressureRuleShells: getRuleFolderId(existing) 우선, 없으면 skip

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, docs/log/log.md

82. 2026-09-11 repairManagedPressureRuleShells + thresholdLink @CUST_ID sync

Purpose: XTK-170036 trailing AND — Console empty contextFilter/deliveryFilter shell 제거·고객번호 집계

Changes:

- buildPressureRuleXml: thresholdLink=@CUST_ID
- repairManagedPressureRuleShells(): RLLguSmsMmsAll/Type2 clean Write
- pressureRule templates: thresholdLink 추가
- lguTestEnsureDeliverySenderFromModel: @deliveryModel-id query 제거

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, upgrade/typologyUpgrade/js/templates/pressureRule_*.template.xml, upgrade/typologySetup/js/_archive/test/lguTestEnsureDeliverySenderFromModel.js, docs/log/log.md

81. 2026-09-11 lguTestEnsureDeliverySenderFromModel getModelId 제거 — queryDef model resolve

Purpose: Test Control rule JST-310000 — lguTypologyPressureAdapter에 getModelId 없음

Changes:

- lguSenderTestResolveModelId: [@recurringDelivery-id] 우선, [@deliveryModel-id] fallback
- shouldPatchSender / loadModelSender / patchSenderFromModel: getModelId 호출 제거

Changed files: upgrade/typologySetup/js/_archive/test/lguTestEnsureDeliverySenderFromModel.js, docs/log/log.md

80. 2026-09-11 acc-reference-index thresholdLink·linked dimension·pressure mapping

Purpose: Agent 1 feasibility validation — phone send vs customerNo fatigue aggregation; index catalog gap fill

Changes:

- acc-reference-index: thresholdLink, linked dimension, pressure targeting vs mapping address, target mapping broadLog keys
- Changelog 2026-09-11 delta

Changed files: .cursor/skills/acc-reference-validator/acc-reference-index.md

79. 2026-09-11 loadRuleTypologyIds TYLgu scan+count — @typology-id queryDef 금지

Purpose: @typology-id queryDef expr → @typology−id parse (Attribute typology unknown on typologyRuleRel)

Changes:

- loadRuleTypologyIds: TYLgu% typology @id select + isRuleTypologyLinkedViaRuleCount per id
- acc-patterns: queryDef @typology-id 금지 (Write FK와 분리) 명시

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, acc-patterns.md

78. 2026-09-11 loadRuleTypologyIds typologyRuleRel query — typology/@id XTK-170036

Purpose: syncFatigueFromForm Save 시 relinkRuleToTypology — typology/@id get queryDef parse 실패

Changes:

- loadRuleTypologyIds: nms:typologyRuleRel select @typology-id WHERE [@rule-id]= (FK 직접)
- acc-patterns: list linked typo ids 패턴 추가

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, acc-patterns.md

77. 2026-09-11 ValidateBeforeSave SOAP long/int 재발 수정

Purpose: log #74 ValidateBeforeSave 추가 시 @LGU_TARGET_TYPE_M_NO type=long 으로 log #67 int 규칙 역행 → Save long/int SOAP 오류

Changes:

- form leave ValidateBeforeSave: @LGU_TARGET_TYPE_M_NO param type int
- schema ValidateBeforeSave: targetTypeNo param type int (entity attribute long 과 분리)
- acc-patterns: fatigue soapCall param type 표 + log grep 필수 명시

Changed files: form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml, schema/LGU_TARGET_TYPE_FATIGUE_M.xml, acc-patterns.md

76. 2026-09-11 fatigue form preSave/preDelete 제거 — leave·navtree delete

Purpose: xtk:form preSave/preDelete XSV 오류 수정; Explorer Delete 시 TYR 잔존 방지

Changes:

- form: preSave/preDelete 제거 — ValidateBeforeSave를 leave로 이동
- navtree: hiddenCommands adbdelete + Rule 연동 삭제 command → DeleteWithRuleSync
- acc-patterns: preSave/preDelete 미지원 명시

Changed files: form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml, navtree/LGU_TARGET_TYPE_FATIGUE_M_navtree.xml, schema/LGU_TARGET_TYPE_FATIGUE_M.xml, js/lguFatigueRuleSync.js, acc-patterns.md

75. 2026-09-11 form Edit cap/period enter fix + Typology Edit relink

Purpose: Nav Edit 시 capCount/periodDays 기본값 덮어쓰기; Typology 변경 지원

Changes:

- form enter: New만 default set — Edit는 DB 값 유지 + /tmp targetPick/typology seed
- Typology 탭: New/Edit 공통 picker (Save 시 relink)
- relinkRuleToTypology: 기존 Typology unlink 후 신규 link

Changed files: form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml, js/lguFatigueRuleSync.js

74. 2026-09-11 fatigue preSave duplicate + preDelete Explorer TYR sync

Purpose: duplicate (messageType+NO) DB 에러 사전 차단; Explorer Delete TYR 잔존 방어

Changes:

- ValidateBeforeSave / PreDeleteRuleSync schema SOAP + form preSave/preDelete
- validateFatigueDuplicateBeforeSave: messageTypeTargetKey 중복 메시지

Changed files: lguFatigueRuleSync.js, schema/LGU_TARGET_TYPE_FATIGUE_M.xml, form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml, acc-patterns.md

73. 2026-09-11 typologyRule filter humanCond + timespan suffix ref table

Purpose: Application/Limit deliveries Operator·Value 빈 UI — condition Write 형식 교정

Changes:

- buildTargetTypeContextFilter/DeliveryFilter: expr 전체 + humanCond (Console conditionlist)
- acc-patterns: timespan suffix(s/m/h/d/w) vs Write seconds 표

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, js/templates/pressureRule_area.template.xml, acc-patterns.md

72. 2026-09-11 periodRanking timespan seconds — fix BAS-010042 Pressure tab 7d

Purpose: TYR Pressure tab BAS-010042 — periodRanking "7d" invalid for timespan UI

Changes:

- buildPeriodRankingTimespan: periodDays × 86400 (schema type timespan)
- templates: periodRanking 604800 (7d)

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, js/templates/pressureRule_*.template.xml, acc-patterns.md

71. 2026-09-11 typologyRule queryDef folder — [folder/@id] not @folder-id in select

Purpose: syncFatigueFromForm XTK-170036 on nms:typologyRule — queryDef select @folder-id 금지

Changes:

- queryFirstTypologyRuleRow / resolveTypologyRuleFolderId: `[folder/@id]` alias
- getRuleFolderId: query 결과 folder-id 통합 read
- acc-patterns: typologyRule folder queryDef vs Write 표

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

70. 2026-09-11 fix queryFirstRow @folder-id — nms:typology XTK-170036 on Save

Purpose: syncFatigueFromForm Save 시 loadTypologyByName queryDef @folder-id parse 오류

Changes:

- queryFirstRow: @id/@name only (공용)
- queryFirstTypologyRuleRow: typologyRule 전용 @folder-id select

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js

69. 2026-09-11 typologyRule folder-id=0 Explorer 미표시 — contextType·repairTypologyRuleFolder

Purpose: DB에 Rule 존재(id 49360)하나 Console TYR Explorer 미표시 — folder-id=0 확인

Changes:

- buildPressureRuleXml: folder-id 필수(미해결 시 throw), contextFilter contextType=2(Delivery)
- repairTypologyRuleFolder(ruleName): peer RLLguSmsMmsAll folder-id 복사

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js

68. 2026-09-11 fatigue sync TYR — folder-id·typologies Write·link verify·diagFatigueSync

Purpose: fatigue OK인데 nms:typologyRule 미생성/미표시 — sync 강화

Changes:

- buildPressureRuleXml: peer Rule folder-id 복사, typologies Write
- syncFatigueRow: Write 후 assertRuleExists, link verify, lastSyncStatus에 ruleId/typoId
- syncFatigueFromForm: forceManaged — silent SKIP 금지
- diagFatigueSync(fatigueId): Console 진단

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js

67. 2026-09-11 fatigue SOAP param int + Typology /tmp/@typologyName preview

Purpose: Save SOAP long/int mismatch; Typology Internal name UI 미반영

Changes:

- schema SyncFromForm/DeleteWithRuleSync: fatigueId type int
- form postSave/Delete: param type int (OOTB delivery.xml 패턴)
- Typology 선택 preview: /tmp/@typologyName → leave 시 @typologyInternalName
- validateFatigueFromForm: typologyInternalName 비어 있으면 채널 default TY fallback (orphan row 복구)

Changed files: upgrade/typologyUpgrade/schema/LGU_TARGET_TYPE_FATIGUE_M.xml, form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml, js/lguFatigueRuleSync.js

66. 2026-09-11 fatigue Save fix — schema default TY·form leave·Typology setOnClick

Purpose: Save 후 ruleInternalName/TY 비어 있음 + xtk:javascript 오류 지속 대응

Changes:

- schema: typologyInternalName default TYLguSmsMms, ruleInternalName required 제거(sync가 채움)
- form: form-level leave 기본값 보강, Typology setOnClick+enter 즉시 preview, lastModified bump

Changed files: upgrade/typologyUpgrade/schema/LGU_TARGET_TYPE_FATIGUE_M.xml, form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml

65. 2026-09-10 fatigue postSave SyncFromForm SOAP — xtk:javascript 제거

Purpose: Save SOP-330005 xtk:javascript 미구현 — schema method SOAP으로 Rule sync

Changes:

- LGU_TARGET_TYPE_FATIGUE_M: SyncFromForm schema method 추가
- lguFatigueRuleSync: lgu_LGU_TARGET_TYPE_FATIGUE_M_SyncFromForm
- inputForm postSave → SyncFromForm; Typology 탭 linkListChoice + 선택 preview frame

Changed files: upgrade/typologyUpgrade/schema/LGU_TARGET_TYPE_FATIGUE_M.xml, js/lguFatigueRuleSync.js, form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml

64. 2026-09-10 fatigue schema messageType default 101 — New enum fix

Purpose: New form 채널 필드 messageType=0 enum 오류 — lgu enum에 101만 유효

Changes:

- LGU_TARGET_TYPE_FATIGUE_M.xml: messageType default 0 → 101
- inputForm enter: set value="101"

Changed files: upgrade/typologyUpgrade/schema/LGU_TARGET_TYPE_FATIGUE_M.xml, upgrade/typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml

63. 2026-09-10 fatigue form New/Edit — _isNewEntity (notebook applicableIf 제거)

Purpose: [@id]=0 notebook applicableIf parse fail — xtk:form 탭에 PK expr 불가

Changes:

- Typology 탭: applicableIf 제거 → visibleGroup + [/ignored/@_isNewEntity]
- Delete 버튼·enter 분기: 동일 _isNewEntity 패턴 (OOTB delivery.xml)
- postSave/soapCall: @id (entity context)

Changed files: upgrade/typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml

62. 2026-09-10 fatigue form expression fix — [@id]·targetPickAll byte

Purpose: form open 오류 — @id unknown, targetPickMode string boolean parse fail

Changes:

- applicableIf/visibleIf: @id → [@id] (xtk:form PK bracket notation)
- targetPickMode string → /tmp/@targetPickAll byte (0=유형지정, 1=All) — OOTB planningType 패턴
- postSave/Delete SOAP param: [@id]

Changed files: upgrade/typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml

61. 2026-09-10 fatigue form Typology picker — where→sysFilter

Purpose: form Import 오류 — linkListChoice 내 where 는 xtk:form schema 미지원

Changes:

- Typology 탭 linkListChoice: `<where>` → `<sysFilter>` (OOTB delivery.xml 패턴)

Changed files: upgrade/typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml

60. 2026-09-10 fatigue JS cleanup — legacy·one-off WF 제거

Purpose: STG/PRD 이관용 Console 산출물만 유지 — RLSmsMms legacy·1회성 WF 스크립트 제거

Changes:

- lguFatigueRuleSync: LEGACY prefix·preDelete·assertManagedRuleWrite 제거; syncAll에 ensureFatigueMetadata 선행
- 삭제: seed_fatigue_wf, migrate_fatigue_rows, repair_fatigue_meta_wf, seed_master_wf, phase0_validate_write
- typologyUpgrade/docs/README.md: js 목록 정리

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, upgrade/typologyUpgrade/docs/README.md (deleted 5 js files)

59. 2026-09-10 fatigue form UI + RLLgu/TYLgu naming refactor

Purpose: form UX 개선(All 선택·Typology 탭·레이아웃) + Rule/TY internal name RLLgu/TYLgu 전환

Changes:

- inputForm: 채널 All 라디오·Typology 탭(New)·padding·우선순위·집계기간 재배치
- lguFatigueRuleSync: RLLgu{Channel}{All|TypeNo}, CHANNEL_CONFIG, duplicate rule name guard
- seed/migrate/repair WF + templates: TYLguSmsMms, RLLguSmsMms*

Changed files: upgrade/typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml, upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, seed_fatigue_wf.js, migrate_fatigue_rows.js, repair_fatigue_meta_wf.js, js/templates/*.xml, schema/LGU_TARGET_TYPE_FATIGUE_M.xml

58. 2026-09-10 fatigue schema messageType enum — lgu:delivery template

Purpose: form 채널 필드 101 enum 오류 — nms template에 lguMMS(101) 미포함

Changes:

- LGU_TARGET_TYPE_FATIGUE_M.xml: messageType template → lgu:delivery:messageType (typologyRule 동일)
- inputForm: 채널 readOnly 고정 (SMS/MMS 전용)

Changed files: upgrade/typologyUpgrade/schema/LGU_TARGET_TYPE_FATIGUE_M.xml, upgrade/typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml

57. 2026-09-10 fatigue form 줄바꿈 손상 복구 — 214→107 lines

Purpose: per-line blank artifact(줄마다 빈 줄)로 214 lines 부풀림 — ACC form Import 실패 대응

Changes:

- LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml 전체 재작성 (107 lines, LF only)
- postSave syncFatigueFromForm + DeleteWithRuleSync 버튼 유지

Changed files: upgrade/typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml

56. 2026-09-10 fatigue form preDelete 제거 — DeleteWithRuleSync 버튼

Purpose: xtk:form preDelete 미지원(XSV) — schema SOAP Delete 버튼으로 Rule+fatigue 삭제

Changes:

- form: preDelete 제거, 연동 상태 탭 Rule 연동 삭제 버튼
- 02_SyncLibrary: Delete 트리거 문서 갱신

Changed files: upgrade/typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml, upgrade/typologyUpgrade/docs/upgradePlan/02_SyncLibrary.md, docs/log/log.md

55. 2026-09-10 fatigue form CRUD — New/Delete Rule auto sync

Purpose: 피로도 UI New/Delete 시 RLSmsMms* Rule 자동 생성·삭제

Changes:

- lguFatigueRuleSync: buildRuleInternalName, validate, ensure, preDeleteFatigueFromForm
- form: enter defaults, preDelete, postSave validate+sync
- seed_master_wf.js 추가

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, upgrade/typologyUpgrade/form/LGU_TARGET_TYPE_FATIGUE_M_inputForm.xml, upgrade/typologyUpgrade/js/seed_master_wf.js, upgrade/typologyUpgrade/docs/upgradePlan/02_SyncLibrary.md, docs/log/log.md

54. 2026-09-10 lguFatigueRuleSync lastSyncAt formatDate fix

Purpose: syncFatigue updateFatigueSyncStatus — raw Date → TIM-030009 해소

Changes:

- lguFatigueAccDateTimeNow(): formatDate(getCurrentDate(), "%4Y-%2M-%2D %2H:%2N:%2S")
- updateFatigueSyncStatus: lastSyncAt formatted string

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, docs/log/log.md

53. 2026-09-10 lguFatigueRuleSync common.js 제거 — WF seed 호환

Purpose: WF seed 실행 시 XSV-350000 xtk:shared/common.js load 실패 해소

Changes:

- lguFatigueRuleSync.js: loadLibrary common.js 제거 (getCurrentDate OOTB)
- seed_fatigue_wf.js: WF seed + syncAll (loadLibrary 없음)

Changed files: upgrade/typologyUpgrade/js/lguFatigueRuleSync.js, upgrade/typologyUpgrade/js/seed_fatigue_wf.js, docs/log/log.md

52. 2026-09-10 Console JS 삭제 이력 정리 — lguTest* archive

Purpose: Console Test·레거시 JS 정리 완료 반영 — 운영 코드만 typologySetup/js 유지

Changes:

- 04_Console_JS_Cleanup.md: 삭제 완료 목록 (Test JS, 레거시, Test Typology rule)
- lguTest*.js → typologySetup/js/_archive/test/
- 01_Console_Setup, 03_Delivery_Prepare, 04_Phase3_Triggers: Test Import 절 제거·cleanup 링크

Changed files: upgrade/typologySetup/docs/04_Console_JS_Cleanup.md, upgrade/typologySetup/js/_archive/test/*, upgrade/typologySetup/docs/*.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, docs/log/log.md

51. 2026-09-10 upgrade 패키지 분리 — typologySetup · typologyUpgrade · shared

Purpose: upgrade/ 하위를 스케줄링 셋업(완료)·피로도 CRUD·공통 delivery 로 모듈 분리

Changes:

- typologySetup: docs, form, js (Pressure Adapter, lguTest*, deliveryCustomizing)
- typologyUpgrade: schema (LGU_TARGET_TYPE_*, typologyRule), fatigue form/navtree/sync JS
- shared: delivery·deliveryMapping schema, custom_lms_mms.js
- default/js: delivery.js, dlvUtils.js, deliverabilityClient-v2.js (OOTB 이관)
- upgrade/README.md, shared/README.md, typologySetup/README.md 신규
- docs·acc-reference-index 경로 갱신

Changed files: upgrade/** (restructure), default/js/*, docs/log/log.md, .cursor/AGENTS.md, acc-reference-index.md

50. 2026-09-10 lguTypologyPressureAdapter — rename from lguEnsureDeliveryScheduling

Purpose: STG/PRD 배포용 Pressure lib 명칭 정리 — 목적(Typology Pressure)이 드러나도록 rename

Changes:

- lguEnsureDeliveryScheduling.js → lguTypologyPressureAdapter.js
- entry: applyTypologyPressureAdapter / applyTypologyPressureAdapterById
- journal prefix: typologyPressureAdapter: patched
- docs·TEST 참조 일괄 갱신

Changed files: upgrade/typologyUpgrade/js/lguTypologyPressureAdapter.js, upgrade/typologyUpgrade/js/lguTest*.js, upgrade/js/lguTestRunDeliveryPrepareMessage.js, upgrade/docs/01_Console_Setup.md, upgrade/docs/03_Delivery_Prepare.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, acc-patterns.md

49. 2026-09-10 lguEnsureDeliveryScheduling — Pressure용 contactDate materialize only

Purpose: extExpr/conExpr 는 Pressure 미적용 — 근본 목적(arbitration)에 맞게 contactDate/extraction materialize 만 유지

Changes:

- lguEnsureDeliveryScheduling.js: expr 패치 제거, live+DB contactDate/extraction materialize
- lguTestEnsureDeliverySchedulingMaterialize.js: main lib alias

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/typologyUpgrade/js/lguTestEnsureDeliverySchedulingMaterialize.js, upgrade/docs/01_Console_Setup.md, acc-patterns.md

48. 2026-09-10 TEST 부록 JS 분리 — content mirror·scheduling materialize

Purpose: STG lib 는 expr+tz only — TEST 전용 제거 기능을 별도 lguTest* JS 로 분리

Changes:

- lguTestEnsureDeliveryContentMirror.js (ensureDeliveryContentMirrorForTypology)
- lguTestEnsureDeliverySchedulingMaterialize.js (ensureDeliverySchedulingMaterializeForTypology)
- 01_Console_Setup.md, 04_Phase3_Triggers.md TEST optional rule 안내

Changed files: upgrade/typologyUpgrade/js/lguTestEnsureDeliveryContentMirror.js, upgrade/typologyUpgrade/js/lguTestEnsureDeliverySchedulingMaterialize.js, upgrade/docs/01_Console_Setup.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md

47. 2026-09-10 lguEnsureDeliveryScheduling scope — expr+tz only

Purpose: STG 적용 범위 — content mirror·contactDate/extraction/delayed 제거, extExpr+conExpr+tz 만

Changes:

- lguEnsureDeliveryScheduling.js: content mirror·PrepareMessage·postTarget helper 제거
- patchScheduling: extractionExpr, contactDateExpr, contactDateTimeZone only
- lguTestRunDeliveryPrepareMessage.js: PrepareMessageImpl inline

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/js/lguTestRunDeliveryPrepareMessage.js, upgrade/docs/03_Delivery_Prepare.md, upgrade/docs/01_Console_Setup.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, acc-patterns.md

46. 2026-09-09 typology postTarget PrepareMessage 롤백 — wkDlv 손상

Purpose: postTarget PrepareMessageImpl → wkdlv_* missing, Counting stuck, recurring delivery 연쇄 생성

Changes:

- ensureDeliveryPrepareMessageForTypology: no-op + warning (typology 호출 금지)
- lguPrepareRunPrepareMessage: Console/WF 전용
- 03_Delivery_Prepare.md, 04_Phase3_Triggers.md, acc-patterns.md 갱신

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/js/lguTestRunDeliveryPrepareMessage.js, upgrade/docs/03_Delivery_Prepare.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, acc-patterns.md

45. 2026-09-09 PrepareMessageImpl — typology static type fix

Purpose: postTarget nms.delivery.PrepareMessage(liveDelivery) → Method not of static type (16384)

Changes:

- lguPrepareInvokePrepareMessage: queryDef get + nms.delivery.create().PrepareMessageImpl()
- lguTestRunDeliveryPrepareMessage.js 동일 패턴

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/js/lguTestRunDeliveryPrepareMessage.js, acc-patterns.md

44. 2026-09-09 postTarget toDeliver=0 skip 제거 — live resolve

Purpose: After targeting postTarget js 시점에 DB properties/@toDeliver 아직 0 — PrepareMessage skip

Changes:

- lguPrepareResolveToDeliver: live delivery.properties.toDeliver 우선
- snap/live=0 이면 postTarget proceed (broadLog guard 유지)

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, acc-patterns.md

43. 2026-09-09 live scheduling node fix — No contact date arbitration

Purpose: WF component live delivery 에 scheduling 노드 없음 → DB patch 만 되고 arbitration 실패

Changes:

- lguPrepareEnsureLiveSchedulingNode, lguPrepareForceLiveSchedulingMaterialized 추가
- preTarget/postTarget enter 로그, DB-only patch 후 live sync

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js

42. 2026-09-09 GitHub 초기 push — Campaign_Typology_Develop

Purpose: 프로젝트 전용 git 저장소 생성 후 GitHub 원격 main 반영

Changes:

- 프로젝트 루트 git init (main), .gitignore 추가
- Initial commit 70 files → origin main push
- .cursor/rules/git-push-merge.mdc — "깃 올려줘" 자동 push/merge 규칙

Changed files: .gitignore, .cursor/rules/git-push-merge.mdc, docs/log/log.md

41. 2026-09-09 acc-reference-index PrepareMessage·postTarget·count delta

Purpose: Agent 1 iteration 1 — dual-algorithm discovery for ensureDeliveryPrepareMessageForTypology scope

Changes:

- acc-reference-index.md: Index lookup + Official tables — PrepareMessage, postTarget/ruleStep, queryDef get, broadLogRcp count, load/JST-310000, linkedDelivery-id
- Changelog row 2026-09-09

Changed files: .cursor/skills/acc-reference-validator/acc-reference-index.md

40. 2026-09-09 postTarget ensureDeliveryPrepareMessageForTypology — WF js6 대체

Purpose: WF delivery component loading 중 js6 실행 불가 — typology postTarget 에서 in-memory PrepareMessage

Changes:

- lguEnsureDeliveryScheduling.js: ensureDeliveryPrepareMessageForTypology, lguPrepareCountBroadLog, snapshot toDeliver/state
- 03_Delivery_Prepare.md, 04_Phase3_Triggers.md: postTarget TEST rule, WF js6 금지
- acc-patterns.md: postTarget PrepareMessage 패턴

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/docs/03_Delivery_Prepare.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

39. 2026-09-09 lguTestRunDeliveryPrepareMessage — STG 제외·load fix

Purpose: WF JST-310000 nms.delivery.load 2-arg; STG 는 lguEnsureDeliveryScheduling.js 만 필요

Changes:

- lguRunDeliveryPrepareMessage.js 삭제 → lguTestRunDeliveryPrepareMessage.js (queryDef get, Test only)
- 01_Console_Setup.md: STG/PRD vs Test Import 분리

Changed files: upgrade/js/lguTestRunDeliveryPrepareMessage.js, upgrade/docs/01_Console_Setup.md, upgrade/docs/03_Delivery_Prepare.md, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

38. 2026-09-09 JS codes 정리 — lguTest* 네이밍·중복 삭제

Purpose: Prepare diag/execute 파일 중복 제거, Test 전용 lguTest* / [LGU TEST] Label 통일

Changes:

- 삭제: validate_delivery_prepare_diag/Message, validate_deliveryMapping_schema, list_delivery_messageTypes, insert_test_recipients, lguEnsureDeliverySenderFromModel_TEST
- 신규: lguTestDeliveryPrepareDiag, lguTestDeliveryMappingSchema, lguTestListDeliveryMessageTypes, lguTestInsertRecipients, lguTestEnsureDeliverySenderFromModel
- 유지: lguRunDeliveryPrepareMessage (운영 WF), lguEnsureDeliveryScheduling (운영 Control)
- upgrade/docs/01_Console_Setup.md §1-4 Console Import/Delete 목록

Changed files: upgrade/js/*.js, upgrade/typologyUpgrade/js/lguTestEnsureDeliverySenderFromModel.js, upgrade/docs/01_Console_Setup.md, upgrade/docs/03_Delivery_Prepare.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

37. 2026-09-09 lguRunDeliveryPrepareMessage WF 후속 스크립트

Purpose: content mirror 성공 후에도 broadLog 0 — campaign WF 가 PrepareTarget 만 실행, PrepareMessage 미호출

Changes:

- upgrade/js/lguRunDeliveryPrepareMessage.js: mirror + PrepareMessage + broadLog 검증 (신규)
- upgrade/docs/03_Delivery_Prepare.md: WF journal 패턴·JS activity 예시

Changed files: upgrade/js/lguRunDeliveryPrepareMessage.js, upgrade/docs/03_Delivery_Prepare.md

36. 2026-09-09 lguMMS PrepareMessage content/sms mirror

Purpose: WF Prepare state 15 + broadLog 0 — OOTB PrepareMessage 가 content/lguMMS/source/MSG 미인식

Changes:

- lguEnsureDeliveryScheduling.js: patchContentMirror (lguMMS MSG → content/sms/source live+DB)
- validate_delivery_prepare_diag.js: smsSource, linkedDelivery-id, WF 경고
- validate_delivery_prepareMessage.js: PrepareMessage 단독 테스트 (신규)
- upgrade/docs/03_Delivery_Prepare.md, acc-patterns.md: WF vs UI 경로 문서화

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/js/validate_delivery_prepare_diag.js, upgrade/js/validate_delivery_prepareMessage.js, upgrade/docs/03_Delivery_Prepare.md, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

35. 2026-09-09 hasDeliveryContent main enter + Prepare targetReady 진단

Purpose: targetReady(state 15) + "1 message(s) waiting" + "content not entered" — PrepareTarget-only (lguMMS hasDeliveryContent 미인식)

Changes:

- default/inputForm/delivery.xml: hasDeliveryContent set expr form main enter 추가 (4번째)
- validate_delivery_prepare_diag.js: hasLguMmsContent + state=15 경고
- upgrade/docs/03_Delivery_Prepare.md, 01_Console_Setup.md: targetReady 멈춤 트러블슈팅

Changed files: default/inputForm/delivery.xml, upgrade/js/validate_delivery_prepare_diag.js, upgrade/docs/03_Delivery_Prepare.md, upgrade/docs/01_Console_Setup.md

34. 2026-09-09 lguEnsureDeliveryScheduling scheduling-only + live patch

Purpose: Pressure arbitration No contact date — DB Write 만으로는 preTarget live delivery 미반영; SSOT target copy 제거

Changes:

- lguEnsureDeliveryScheduling.js: SSOT/target copy 삭제, live delivery.scheduling + DB dual patch, CHANNEL_MESSAGE_TYPES registry
- acc-patterns.md, upgrade/docs/03_Delivery_Prepare.md: scheduling-only scope 반영

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md, upgrade/docs/03_Delivery_Prepare.md

33. 2026-09-09 patchScheduling formatDate — typology NL.XTK undefined

Purpose: Control rule 컴파일 실패 JST-310000 NL.XTK is undefined (typology 컨텍스트)

Changes:

- lguEnsureDeliveryScheduling.js: lguPrepareAccDateTimeNow → formatDate(getCurrentDate(), "%4Y-%2M-%2D %2H:%2N:%2S"), loadLibrary nl.js 제거
- acc-patterns.md: typology datetime Write 패턴 갱신

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

32. 2026-09-09 patchScheduling contactDate ISO8601 (TIM-030009)

Purpose: Prepare 중 patchScheduling Write 실패 — JS Date toString 이 @contactDate 에 저장됨

Changes:

- lguEnsureDeliveryScheduling.js: loadLibrary xtk:shared/nl.js, lguPrepareAccDateTimeNow → NL.XTK.formatDateTime(getCurrentDate())
- acc-patterns.md: Prepare scheduling row ISO8601 명시

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

31. 2026-09-09 MSG template 복사 롤백 — delivery UI SENDER 흐름 정정

Purpose: template MSG+SENDER 복사는 운영 흐름(component UI select)과 불일치 — 롤백

Changes:

- lguEnsureDeliverySenderFromModel_TEST.js: SENDER-only fallback, template empty OK 주석
- acc-patterns.md, 03_Delivery_Prepare.md: delivery component Save 흐름 명시
- lguEnsureDeliveryScheduling.js contactDate materialize 는 유지

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliverySenderFromModel_TEST.js, acc-patterns.md, upgrade/docs/03_Delivery_Prepare.md

30. 2026-09-09 Prepare MSG+SENDER 복사 + contactDate materialize

Purpose: Prepare targetReady(15) 정체 — MSG 미복사·contactDate 미설정으로 personalization 대기

Changes:

- lguEnsureDeliverySenderFromModel_TEST.js: MSG+SENDER model copy (either blank triggers patch)
- lguEnsureDeliveryScheduling.js: contactDate/extraction getCurrentDate() Write, shouldPatchScheduling 확장
- validate_delivery_prepare_diag.js: SENDER/MSG/contactDate 로그 추가
- acc-patterns.md: Prepare scheduling + lguMMS content rows

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliverySenderFromModel_TEST.js, upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/js/validate_delivery_prepare_diag.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

29. 2026-09-09 validate_delivery_prepare_diag getIfExists 루트 접근 수정

Purpose: diag 로그 전 필드 공백 — getIfExists 결과를 delRes.delivery 로 잘못 접근; lib auto-exec 중복

Changes:

- validate_delivery_prepare_diag.js: row 직접 접근, [@mapping-id], for each broadLog, bottom auto-call 제거
- acc-patterns.md: getIfExists nms:delivery + lib auto-exec rows

Changed files: upgrade/js/validate_delivery_prepare_diag.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

28. 2026-09-09 validate_delivery_prepare_diag @toSend 제거

Purpose: XTK-170036 — nms:delivery properties 에 @toSend 없음; @toDeliver 가 "Messages to send" 카운터

Changes:

- validate_delivery_prepare_diag.js: @toSend 제거, deliveryState/reject/sms 추가
- acc-patterns.md: delivery properties row 추가

Changed files: upgrade/js/validate_delivery_prepare_diag.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

27. 2026-09-09 validate_delivery_prepare_diag mapping/@id xpath 수정

Purpose: XTK-170036 `@mapping-id` in queryDef node expr — link xpath `[mapping/@id]` 로 교체

Changes:

- validate_delivery_prepare_diag.js: select `[mapping/@id]`, access `del.mapping.@id`
- acc-patterns.md: queryDef FK/link row 추가

Changed files: upgrade/js/validate_delivery_prepare_diag.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

26. 2026-09-09 validate_delivery_prepare_diag.js — WF queryDef-only 진단

Purpose: WKF234/js6 broadLog 진단 스크립트 JST-310000 invalid XML name — nms.delivery.load + d.properties.toDeliver 패턴 제거

Changes:

- upgrade/js/validate_delivery_prepare_diag.js: queryDef-only delivery/mapping/broadLogRcp dump
- acc-patterns.md: WF diag + broadLog iterate anti-pattern 추가

Changed files: upgrade/js/validate_delivery_prepare_diag.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

25. 2026-09-09 deliveryMapping lguMMS inline hook — lib form 제거

Purpose: XML-110013 — lgu:deliveryMapping lib form 은 Input forms 미리보기 컨텍스트 부재로 @lguMMS 검증 실패. uplus 패턴(custmms inline)으로 정정

Changes:

- upgrade/form/deliveryMapping_lgu.xml 삭제 (lib form)
- upgrade/form/deliveryMapping_lgu_hook.xml: nms inline fragment + schema/form 구분 주석
- upgrade/js/validate_deliveryMapping_schema.js: Console schema 검증 스크립트
- upgrade/docs/01_Console_Setup.md: lib form → inline hook 절차

Changed files: upgrade/form/deliveryMapping_lgu_hook.xml, upgrade/js/validate_deliveryMapping_schema.js, upgrade/docs/01_Console_Setup.md (deliveryMapping_lgu.xml deleted)

24. 2026-09-09 uplus:deliveryMapping 복구 SSOT + lgu schema 롤백

Purpose: Console uplus:deliveryMapping 덮어쓰기 복구 — default form 기준 custmms/lgu_mms 재정의, lgu extended 초版 복원

Changes:

- upgrade/schema/deliveryMapping_uplus.xml: uplus:deliveryMapping @custmms, @lgu_mms (신규)
- upgrade/schema/deliveryMapping_lgu.xml: sqlname sLguMMS 복원, belongsTo 제거
- upgrade/docs/01_Console_Setup.md, deliveryMapping_lgu.xml: uplus→lgu Import 순서·namespace 주의

Changed files: upgrade/schema/deliveryMapping_uplus.xml, upgrade/schema/deliveryMapping_lgu.xml, upgrade/docs/01_Console_Setup.md, upgrade/form/deliveryMapping_lgu.xml

23. 2026-09-09 deliveryMapping_lgu schema XML-110013 대응

Purpose: Attribute lguMMS unknown — schema 선행 Import·DB 갱신·검증 순서 문서화, sqlname 제거

Changes:

- upgrade/schema/deliveryMapping_lgu.xml: belongsTo 추가, sqlname 제거(ACC auto), 검증 주석
- upgrade/form/deliveryMapping_lgu.xml, 01_Console_Setup.md: Import 순서·Execute 검증 스니펫

Changed files: upgrade/schema/deliveryMapping_lgu.xml, upgrade/form/deliveryMapping_lgu.xml, upgrade/docs/01_Console_Setup.md

22. 2026-09-09 deliveryMapping_nms.xml 제거 — ref 위치 주석으로 대체

Purpose: nms hook 전용 xml 대신 Console 수동 반영 — ref 삽입 위치를 deliveryMapping_lgu.xml 주석에 SSOT화

Changes:

- upgrade/form/deliveryMapping_lgu.xml: nms ref 삽입 위치·anchor·Import 순서 주석 보강
- upgrade/docs/01_Console_Setup.md: deliveryMapping_nms Import 절 제거, 수동 hook 안내

Changed files: upgrade/form/deliveryMapping_lgu.xml, upgrade/docs/01_Console_Setup.md

21. 2026-09-09 deliveryMapping form extend 패턴 수정 (default OOTB 복원)

Purpose: default/inputForm 직접 수정 대신 lgu lib + nms hook extend 패턴으로 정정 (deliveryCustomMMS 동일)

Changes:

- default/inputForm/deliveryMapping.xml: @lguMMS 직접 추가분 revert (OOTB 유지)
- upgrade/form/deliveryMapping_lgu.xml: lgu:deliveryMapping lib/lguMmsAddress
- upgrade/form/deliveryMapping_nms.xml: nms:deliveryMapping + ref lgu lib (Console Import용)
- upgrade/docs/01_Console_Setup.md: form Import 경로 수정

Changed files: default/inputForm/deliveryMapping.xml, upgrade/form/deliveryMapping_lgu.xml, upgrade/form/deliveryMapping_nms.xml, upgrade/docs/01_Console_Setup.md

20. 2026-09-09 lgu:deliveryMapping lguMMS 주소 매핑 확장

Purpose: messageType lguMMS(101) 발송 시 target mapping Address 필드 부재 → broadLog @address 미해석 방지

Changes:

- upgrade/schema/deliveryMapping_lgu.xml: lgu:deliveryMapping extendedSchema, attribute @lguMMS
- upgrade/docs/01_Console_Setup.md: 스키마 Import·mapRecipient 설정 절 추가

Changed files: upgrade/schema/deliveryMapping_lgu.xml, upgrade/docs/01_Console_Setup.md

19. 2026-09-09 nms:delivery hasDeliveryContent lguMMS 패치

Purpose: UI "Content has not been entered yet" — OOTB hasDeliveryContent 가 lguMMS(101) 미인식 (101 > other=120 false)

Changes:

- default/inputForm/delivery.xml: hasDeliveryContent set expr 3곳에 lguMMS MSG+SENDER 조건 추가
- acc-patterns.md, 01_Console_Setup.md: OOTB form gap 문서화

Changed files: default/inputForm/delivery.xml, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md, upgrade/docs/01_Console_Setup.md

18. 2026-09-09 Control rule return true + SSOT DM473 lookup

Purpose: Prepare Rule detected a problem — wrong template 47590 (empty target) + missing return true

Changes:

- lguEnsureDeliveryScheduling.js: SSOT_TEMPLATE_INTERNAL_NAME DM473, select prefer nonEmpty target, entry return true
- lguEnsureDeliverySenderFromModel_TEST.js: entry return true
- 04_Phase3_Triggers.md, acc-patterns.md: return true + DM473

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/typologyUpgrade/js/lguEnsureDeliverySenderFromModel_TEST.js, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

17. 2026-09-09 lguEnsureDeliveryScheduling SSOT lookup by deliveryCode

Purpose: XTK-170036 deliveryModel-id unknown — default/schema/delivery.xml 에 FK attrs 없음 확인

Changes:

- lguEnsureDeliveryScheduling.js: lguPrepareResolveSsotTemplateId (@deliveryCode + @isModel=1 + op=0)
- acc-patterns.md, acc-reference-index.md, 04_Phase3_Triggers.md, R14 갱신

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md, .cursor/skills/acc-reference-validator/acc-reference-index.md, .cursor/skills/acc-reference-validator/SKILL.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md

16. 2026-09-09 acc-reference-validator dual-algorithm + reference index

Purpose: Agent 1 공식문서 검색·index 관리 미흡 — Algorithm 2(lookup) + Algorithm 1(discovery) 분리, orchestrator default 호출

Changes:

- acc-reference-index.md: Experience League URL 카탈로그 + 키워드 lookup + Changelog
- acc-reference-validator/SKILL.md: dual-algorithm 절차, R14-R16, index delta 리포트
- acc-pipeline-orchestrator/SKILL.md: Agent 1 항상 호출, index delta 검수 gate
- AGENTS.md, adobe-acc-orchestrator.mdc: default orchestrator → reference validator

Changed files: .cursor/skills/acc-reference-validator/acc-reference-index.md, .cursor/skills/acc-reference-validator/SKILL.md, .cursor/skills/acc-pipeline-orchestrator/SKILL.md, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md, .cursor/AGENTS.md, .cursor/rules/adobe-acc-orchestrator.mdc

15. 2026-09-09 lguEnsureDeliveryScheduling model-id → deliveryModel-id xpath 수정

Purpose: Prepare XTK-170036 — nms:delivery 에 @model-id 없음, queryDef ExecuteQuery 실패

Changes:

- lguEnsureDeliveryScheduling.js: [@recurringDelivery-id] + [@deliveryModel-id] 로 교체
- getModelId: recurringDelivery-id 우선, deliveryModel-id fallback
- acc-patterns.md, 04_Phase3_Triggers.md 반영

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md

14. 2026-09-09 lguEnsureDeliveryScheduling Console 구버전 재Import 안내 + delivery.id

Purpose: Prepare 재실패 line 39 — Console 에 277줄 구버전(object literal) 잔존 확인

Changes:

- lguEnsureDeliveryScheduling.js: lguPrepareResolveDeliveryId 에 delivery.id 만 사용, 282줄 최종본 Write 동기화
- IDE/OneDrive 구버전(277줄) vs 디스크(282줄) 불일치 해소

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js

13. 2026-09-09 lguEnsureDeliveryScheduling E4X object literal 컴파일 오류 수정

Purpose: Prepare 실패 JST-310000 line 39 invalid XML name — object literal 내부 delivery.@id 컴파일 거부

Changes:

- lguEnsureDeliveryScheduling.js: lguPrepare* top-level 함수로 분리, lib는 config + 함수 참조 할당
- lguEnsureDeliverySenderFromModel_TEST.js: 동일 패턴 적용, lguPrepare* 재사용
- acc-patterns.md: E4X @ object literal 금지 규칙 추가

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/typologyUpgrade/js/lguEnsureDeliverySenderFromModel_TEST.js, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md

12. 2026-09-09 ACC JS codes Internal name .js 접미사 규칙 문서화

Purpose: Console JS codes name 및 loadLibrary 에 .js 필수 (JST-310003 방지)

Changes:

- 04_Phase3_Triggers.md, 01_Console_Setup.md, acc-patterns.md: .js naming 규칙
- lguEnsureDeliveryScheduling.js, lguEnsureDeliverySenderFromModel_TEST.js: docstring 갱신

Changed files: upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, upgrade/docs/01_Console_Setup.md, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md, upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/typologyUpgrade/js/lguEnsureDeliverySenderFromModel_TEST.js

11. 2026-09-09 deliveryCustomMMS enum 참조 수정 (XSV-350000)

Purpose: enum="uplus:delivery:sender_list" 가 Test Console 에 없는 srcSchema 직접 로드 → Delivery 폼 오류

Changes:

- deliveryCustomMMS.xml: enum 속성 제거, type=sysenum + xpath만 (merged schema)
- delivery_uplus.xml: SENDER type=CDATA 복원 (Stage 동일)
- 01_Console_Setup.md: enum 참조 금지 안내

Changed files: upgrade/form/deliveryCustomMMS.xml, upgrade/schema/delivery_uplus.xml, upgrade/docs/01_Console_Setup.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md

10. 2026-09-09 Prepare lib 분리 — 공통 scheduling/target + TEST SENDER 부록

Purpose: STG/PRD SENDER 수동 Save 보호; Test 전용 SENDER patch 분리; 다채널·delivery 객체 단위 Context

Changes:

- lguEnsureDeliveryScheduling.js: lguDeliveryPrepareLib + LguDeliveryPrepareContext(prototype), CHANNEL_MESSAGE_TYPES, SENDER 제거
- lguEnsureDeliverySenderFromModel_TEST.js: TEST 전용 SENDER model copy
- 04_Phase3_Triggers.md, 03_Delivery_Prepare.md: STG/PRD vs Test Control rule 분리

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/typologyUpgrade/js/lguEnsureDeliverySenderFromModel_TEST.js, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, upgrade/docs/03_Delivery_Prepare.md

9. 2026-09-09 lguEnsureDeliveryScheduling 줄바꿈 복구 + ACC R13 검증 규칙

Purpose: ACC JS Import 시 줄마다 빈 줄 삽입(552행) → SCR-160012; 서브에이전트 검증에 줄바꿈 체크 필수화

Changes:

- lguEnsureDeliveryScheduling.js: LF 단일 줄바꿈으로 재작성 (~277행)
- acc-reference-validator R13, acc-whitebox-tester dimension F, acc-patterns, orchestrator prompt

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, .cursor/skills/acc-reference-validator/SKILL.md, .cursor/skills/acc-whitebox-tester/SKILL.md, .cursor/skills/acc-pipeline-orchestrator/acc-patterns.md, .cursor/skills/acc-pipeline-orchestrator/SKILL.md

8. 2026-09-09 SENDER Save fix + Prepare auto-patch (target/content/scheduling)

Purpose: 발신번호 enum UI 미저장·WF clone 시 SENDER/target/scheduling 미복사 → 반복 테스트마다 수동 보정 불필요

Changes:

- deliveryCustomMMS.xml: SENDER type=sysenum, Save leave 검증
- delivery_uplus.xml: SENDER type string (enum)
- lguEnsureDeliveryScheduling.js: ensureDeliveryContentFromModel, ensureDeliveryTargetFromModel, ensureDeliveryPrepareForTypology
- 03_Delivery_Prepare.md, 04_Phase3_Triggers.md: SSOT template + Control rule 3-layer

Changed files: upgrade/form/deliveryCustomMMS.xml, upgrade/schema/delivery_uplus.xml, upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/docs/03_Delivery_Prepare.md, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md

7. 2026-09-09 lguEnsureDeliveryScheduling Control typology rule

Purpose: OOTB clone 시 scheduling expr 미복사 → Prepare 시 GetDate()+Seoul 자동 Write (주기 WF 없이 Pressure 적용)

Changes:

- lguEnsureDeliveryScheduling.js: ensureDeliveryScheduling, ensureDeliverySchedulingForTypology
- 04_Phase3_Triggers.md §3-4 Console 배포 절차
- 03_Delivery_Prepare.md: SSOT Write + Control rule 2-layer 모델

Changed files: upgrade/typologyUpgrade/js/lguEnsureDeliveryScheduling.js, upgrade/typologyUpgrade/docs/packageRun/04_Phase3_Triggers.md, upgrade/docs/03_Delivery_Prepare.md

6. 2026-09-08 nms:delivery form — lgu_off_inbound_shop EV hook 제거

Purpose: messageType enum 에 없는 lgu_off_inbound_shop EV() parse 오류(XTK-170012) 해소

Changes:

- default/inputForm/delivery.xml: lgu_off_inbound_shopDefinition container 삭제
- delivery_nms_ref_hook.xml: EV enum 존재 조건 주석

Changed files: default/inputForm/delivery.xml, upgrade/form/delivery_nms_ref_hook.xml

5. 2026-09-08 delivery schema 분리·중복 정리 (delivery_lgu / delivery_uplus)

Purpose: uplus/lgu delivery 확장 겹침 제거 — list/detail schema unknown 오류 방지

Changes:

- delivery_lgu.xml: messageType·피로도·성공지표 SQL만 (content/lguMMS 중복 제거)
- delivery_uplus.xml: content/*·paidParameters·enum, TEST_SUCCESS_METRIC 제거, 주석 블록 삭제
- Console setup docs: delivery.xml → delivery_uplus + delivery_lgu Import 순서

Changed files: upgrade/schema/delivery_lgu.xml, upgrade/schema/delivery_uplus.xml, upgrade/docs/, upgrade/typologyUpgrade/docs/packageRun/

4. 2026-09-08 lgu:delivery schema — LGU_SUCCESS_METRIC_M_NO 명명 통일

Purpose: deliveryCustomMMS schema unknown 오류 해소 및 TEST_* → LGU_* 명명 통일

Changes:

- delivery.xml: 줄바꿈 정리, @LGU_SUCCESS_METRIC_M_NO, content/lguMMS/source/* 추가
- deliveryCustomMMS.xml: TEST_SUCCESS_METRIC_M → LGU_SUCCESS_METRIC_M, xpath @LGU_SUCCESS_METRIC_M_NO

Changed files: upgrade/schema/delivery.xml, upgrade/form/deliveryCustomMMS.xml

3. 2026-09-08 SMS/MMS 피로도 Rule 2행 (RLSmsMmsAll/Type2) 반영

Purpose: Console 실제 Rule 2개(SMS/MMS) 기준으로 migrate·sync prefix·문서·template 일치

Changes:

- migrate_fatigue_rows.js: 2행, messageType 101, RLSmsMmsAll(10/7d), RLSmsMmsType2(NO=2, 2/7d)
- lguFatigueRuleSync.js: RULE_NAME_PREFIX RLSmsMms
- templates, phase0, docs 전반 SMS/MMS 2 Rule 기준 갱신

Changed files: upgrade/typologyUpgrade/js/, upgrade/docs/, upgrade/schema/LGU_TARGET_TYPE_FATIGUE_M.xml

2. 2026-09-08 LGU_TARGET_TYPE_FATIGUE_M 피로도 관리 스키마 및 typologyUpgrade 전면 재구성

Purpose: Stage 마스터(LGU_TARGET_TYPE_M)와 분리된 피로도 cap 관리 스키마 신설, typologyUpgrade 패키지·문서 전면 교체

Changes:

- upgrade/schema/LGU_TARGET_TYPE_FATIGUE_M.xml 신규
- typologyUpgrade: lguFatigueRuleSync.js, migrate_fatigue_rows.js, form, navtree
- marketingAreaCap / wooFatigueRuleSync 제거
- delivery.xml marketingParameters 제거, lgu namespace
- delivery_inputForm.xml, delivery_nms_ref_hook.xml Ver.2 targetType
- typologyUpgrade/docs, upgrade/docs 전면 재작성 및 파일 넘버링 정리

Changed files: upgrade/schema/, upgrade/form/, upgrade/typologyUpgrade/, upgrade/docs/

1. 2026-09-08 Ver.2 LGU_TARGET_TYPE_M_NO 필드 통일 및 배포 문서

Purpose: Ver.1 marketingAreaCap/marketingParameters에서 Ver.2 lgu:LGU_TARGET_TYPE_M + @LGU_TARGET_TYPE_M_NO 전환을 위한 필드명 통일, 로드맵·배포·cleanup 가이드 작성

Changes:

- deliveryCustomMMS.xml: TEST_TARGET_TYPE_M → LGU_TARGET_TYPE_M, xpath @LGU_TARGET_TYPE_M_NO 통일
- LGU_TARGET_TYPE_M.xml: PK key name LGU_TARGET_TYPE_M_PK
- delivery.xml: Ver.2 모듈 docstring 갱신

Changed files: upgrade/form/deliveryCustomMMS.xml, upgrade/schema/LGU_TARGET_TYPE_M.xml, upgrade/schema/delivery.xml, docs/log/log.md
