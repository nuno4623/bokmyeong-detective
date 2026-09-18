/* ═══════════════════════════════════════════════════════════════
   복명초 탐정단 — 모둠 진행 상황 수집기 (Google Apps Script)

   ■ 설정 순서 (한 번만, 약 5분)

   1. https://sheets.google.com 에서 새 스프레드시트를 만듭니다.
      이름은 아무거나 — 예: "복명초 탐정단 진행상황"

   2. 그 시트에서  확장 프로그램 ▸ Apps Script  를 엽니다.

   3. 편집기에 있던 내용을 전부 지우고, 이 파일 내용을 통째로 붙여 넣습니다.
      (이 주석까지 같이 붙여 넣어도 됩니다)

   4. 저장(💾) 후  배포 ▸ 새 배포  를 누릅니다.
        - 유형 선택(⚙️) ▸ 웹 앱
        - 설명:            아무거나
        - 다음 사용자로 실행:  나
        - 액세스 권한이 있는 사용자:  ★ 모든 사용자 ★   ← 이게 핵심입니다
      배포를 누르면 권한 승인을 요구합니다. 승인해 주세요.
      ("이 앱은 확인되지 않았습니다" 경고가 나오면
        고급 ▸ 안전하지 않은 페이지로 이동 을 누르면 됩니다. 선생님이 직접 만든 스크립트입니다.)

   5. 마지막에 나오는 웹 앱 URL 을 복사합니다.
        https://script.google.com/macros/s/AKfy....../exec

   6. 저장소의 config.js 를 열어  window.SYNC_URL = '여기에 붙여넣기';  하고
      저장 → 커밋 → 푸시하면 끝입니다.

   ■ 코드를 고친 뒤에는
      배포 ▸ 배포 관리 ▸ (연필 아이콘) ▸ 버전: 새 버전 ▸ 배포
      로 다시 배포해야 반영됩니다. URL 은 그대로입니다.

   ■ 수업이 끝나고 기록을 지우려면
      시트에서 헤더(1행)만 남기고 아래 행을 지우면 됩니다.
   ═══════════════════════════════════════════════════════════════ */

var SHEET_NAME = '진행상황';
var HEADERS = ['모둠명', '연 단서', '단서 목록', '지목 시도', '해결', '막힌 문제(현재)',
               '마지막 활동', '마지막 접속', '지목 용의자', '근거1', '근거2', '근거3', '악보 위치'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#E6EAF2');
    sh.setColumnWidth(1, 160);
    sh.setColumnWidths(10, 4, 220);
  }
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/* 모둠 태블릿이 진행 상황을 올릴 때 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: 'busy' });
  }
  try {
    var d = JSON.parse(e.postData.contents);
    var team = String(d.team || '').trim().slice(0, 40);
    if (!team) return json_({ ok: false, error: 'no team' });

    var sh = sheet_();
    var now = new Date();
    var last = sh.getLastRow();
    var row = -1;
    if (last >= 2) {
      var names = sh.getRange(2, 1, last - 1, 1).getValues();
      for (var i = 0; i < names.length; i++) {
        if (String(names[i][0]).trim() === team) { row = i + 2; break; }
      }
    }

    // 마지막 활동 시각은 실제 행동(단서 오픈·오답·지목)이 있을 때만 새로 찍는다.
    // 60초마다 오는 생존 신호로는 갱신하지 않아야 "멈춘 모둠"을 골라낼 수 있다.
    var lastActive = now;
    if (!d.active && row > 0) {
      var prev = sh.getRange(row, 7).getValue();
      if (prev) lastActive = prev;
    }

    var rec = [
      team,
      d.openedCount || 0,
      (d.opened || []).join(' '),
      d.tries || 0,
      d.solved ? '해결' : '',
      typeof d.stuck === 'string' ? d.stuck : (d.stuck || []).join(' '),
      lastActive,
      now,
      d.suspect || '',
      String(d.r1 || '').slice(0, 500),
      String(d.r2 || '').slice(0, 500),
      String(d.r3 || '').slice(0, 500),
      String(d.place || '').slice(0, 200)
    ];

    if (row > 0) sh.getRange(row, 1, 1, rec.length).setValues([rec]);
    else sh.appendRow(rec);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* 선생님 모니터링 화면이 전체를 읽어 갈 때 */
function doGet() {
  try {
    var sh = sheet_();
    var last = sh.getLastRow();
    var rows = [];
    if (last >= 2) {
      var vals = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
      for (var i = 0; i < vals.length; i++) {
        var r = vals[i];
        if (!String(r[0]).trim()) continue;
        rows.push({
          team: String(r[0]),
          openedCount: Number(r[1]) || 0,
          opened: String(r[2] || '').split(' ').filter(String).map(Number),
          tries: Number(r[3]) || 0,
          solved: r[4] === '해결',
          stuck: String(r[5] || ''),
          lastActive: r[6] ? new Date(r[6]).getTime() : 0,
          lastSeen: r[7] ? new Date(r[7]).getTime() : 0,
          suspect: String(r[8] || '')
        });
      }
    }
    return json_({ ok: true, now: new Date().getTime(), rows: rows });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
