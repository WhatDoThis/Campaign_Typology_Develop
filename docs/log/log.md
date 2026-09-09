# Log

## Log Index

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
