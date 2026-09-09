/**
 * lgu.lguTestInsertRecipients.js ([LGU TEST] 피로도 테스트 수신자 등록)
 * =======================================================================
 * Console Label: [LGU TEST] Insert Recipients
 * Test 서버 전용 — nms:recipient 테스트 2건 upsert.
 *
 * [Main Functions]
 * ===========
 * - lguTestInsertRecipients: T우1/T우2 테스트 수신자 등록
 *
 * [Dependencies]
 * =========
 * - nms:recipient, xtk:session.Write
 */

// 1.
function lguTestInsertRecipients() {
  var TEST_RECIPIENTS = [
    {email: "hiwoo@ibank.co.kr", lastName: "T우1", customerNo: "TEST_CUST_001"},
    {email: "whi21@naver.com", lastName: "T우2", customerNo: "TEST_CUST_002"}
  ];

  for each (var row in TEST_RECIPIENTS) {
    try {
      xtk.session.Write(
        <recipient xtkschema="nms:recipient"
                   _operation="insertOrUpdate"
                   _key="@email"
                   email={row.email}
                   lastName={row.lastName}
                   customerNo={row.customerNo}/>
      );
      logInfo("lguTestInsertRecipients: OK email=" + row.email);
    } catch (e) {
      logError("lguTestInsertRecipients: FAILED email=" + row.email + " cause=" + e);
    }
  }
}
