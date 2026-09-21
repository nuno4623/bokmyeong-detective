/* ═══════════════════════════════════════════════════════════════
   우리 반 AI 게임 아케이드 — 작품 보관소 (Google Apps Script)

   arcade.html 에서 학생이 등록한 게임을 선생님 구글 스프레드시트에 저장합니다.
   이걸 연결해야 "올린 게임이 모든 기기에서 똑같이 보이고, 새로고침해도 남습니다".

   ※ 탐정단 모니터링(apps-script.gs)과는 별개입니다.
      스크립트 하나에 doGet/doPost 는 하나씩만 둘 수 있어서,
      스프레드시트와 배포를 따로 만들어야 합니다. (순서는 똑같습니다)

   ■ 어느 스프레드시트에 쌓이나
      · 스프레드시트에서  확장 프로그램 ▸ Apps Script  로 만들었다면  → 그 스프레드시트
      · script.google.com 에서 새 프로젝트로 만들었다면
        → 내 드라이브에 "우리 반 게임 아케이드 (작품 보관소)" 를 알아서 하나 만듭니다
      · 쓰던 스프레드시트를 지정하고 싶으면
        → ⚙️ 프로젝트 설정 ▸ 스크립트 속성 에  SHEET_ID  = 그 시트 주소의 가운데 긴 문자열
           (https://docs.google.com/spreadsheets/d/★이부분★/edit)

      지금 어느 시트에 쌓이는지는 배포 주소 뒤에  ?mode=info  를 붙여서 열면 링크가 나옵니다.

   ■ 설정 순서 (한 번만, 약 5분)

   1. https://sheets.google.com 에서 새 스프레드시트를 만듭니다.
      이름은 아무거나 — 예: "우리 반 게임 아케이드"

   2. 그 시트에서  확장 프로그램 ▸ Apps Script  를 엽니다.

   3. 편집기에 있던 내용을 전부 지우고, 이 파일 내용을 통째로 붙여 넣습니다.

   4. 저장(💾) 후  배포 ▸ 새 배포  를 누릅니다.
        - 유형 선택(⚙️) ▸ 웹 앱
        - 다음 사용자로 실행:        나
        - 액세스 권한이 있는 사용자:  ★ 모든 사용자 ★   ← 이게 핵심입니다
      권한 승인을 요구하면 승인해 주세요.
      ("이 앱은 확인되지 않았습니다" 경고 → 고급 ▸ 안전하지 않은 페이지로 이동)

   5. 마지막에 나오는 웹 앱 URL 을 복사합니다.
        https://script.google.com/macros/s/AKfy....../exec

   6. 저장소의 config.js 를 열어  window.ARCADE_URL = '여기에 붙여넣기';  하고
      저장 → 커밋 → 푸시하면 끝입니다.

   ■ 코드를 고친 뒤에는
      배포 ▸ 배포 관리 ▸ (연필 아이콘) ▸ 버전: 새 버전 ▸ 배포
      로 다시 배포해야 반영됩니다. URL 은 그대로입니다.

   ■ 관리자 모드 열쇠 정하기 (선택, 1분)  ← 이걸 해야 화면에서 바로 지울 수 있습니다
      1. Apps Script 편집기 왼쪽의  ⚙️ 프로젝트 설정  을 엽니다
      2. 맨 아래  스크립트 속성  ▸  스크립트 속성 추가
      3. 속성 =  ADMIN_KEY      값 = 선생님만 아는 암호 (예: mirae-2026-music)
         · 학생이 눌러 볼 만한 쉬운 말은 피하세요
         · 이 암호는 깃허브 저장소에 올라가지 않습니다. 여기에만 있습니다
      4. 저장 → 배포 ▸ 배포 관리 ▸ (연필) ▸ 버전: 새 버전 ▸ 배포

      그다음 아케이드 주소 뒤에  ?admin=암호  를 붙여서 열면
      (.../arcade.html?admin=mirae-2026-music)
      각 게임 카드에 «숨기기»·«삭제» 버튼이 생깁니다.
      암호를 바꾸고 싶으면 위 3번 값만 고치고 다시 배포하면 됩니다.

   ■ 올라온 게임을 시트에서 직접 다루려면  ← 위 방법 대신 써도 됩니다
      «아케이드» 시트에서
        · 숨기기: 그 줄의 «상태» 칸에  숨김  이라고 적으면 목록에서 사라집니다
                  (되돌리려면 그 글자를 지우면 됩니다)
        · 완전 삭제: 그 줄을 삭제하면 됩니다
                  («작품데이터» 시트에 같은 ID 로 남은 줄도 같이 지우면 깔끔합니다.
                   안 지워도 목록에는 안 나옵니다)
      수업이 끝나고 전부 비우려면 두 시트 모두 헤더(1행)만 남기고 지우세요.

   ■ 왜 시트가 두 장인가
      포스터 사진과 게임 HTML 은 셀 하나(5만 자)에 안 들어갑니다.
      그래서 «아케이드» 에는 목록에 필요한 정보만, «작품데이터» 에는 긴 내용을
      4만 자씩 잘라서 여러 줄로 나눠 담습니다. 손으로 고칠 일은 없습니다.
   ═══════════════════════════════════════════════════════════════ */

var META_SHEET = '아케이드';
var DATA_SHEET = '작품데이터';
var META_HEADERS = ['ID', '등록시각', '학생', '학급', '제목', '장르', '설명',
                    '좋아요', '플레이', '상태', '썸네일'];
var DATA_HEADERS = ['ID', '종류', '순번', '내용'];

var CHUNK      = 40000;    // 셀 하나에 담을 글자 수 (구글 한도는 5만)
var MAX_THUMB  = 45000;    // 썸네일은 셀 하나에 들어가야 한다
var MAX_BLOB   = 1500000;  // 포스터·코드 한 편당 최대 글자 수
var MAX_GAMES  = 300;      // 시트가 감당할 만한 상한

/* 어느 스프레드시트에 담을지 정한다.

   1) 스크립트 속성 SHEET_ID 가 있으면 그 시트        ← 쓰던 시트를 지정하고 싶을 때
   2) 스프레드시트에 붙어 있는 스크립트면 그 시트     ← 확장 프로그램 ▸ Apps Script 로 만든 경우
   3) 둘 다 아니면 보관용 시트를 하나 만들어 둔다     ← script.google.com 에서 만든 경우

   3번으로 만들어진 시트가 어디 있는지는
   배포 주소 뒤에 ?mode=info 를 붙여서 열면 링크가 나옵니다. */
function book_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (err) {
      throw new Error('스크립트 속성 SHEET_ID 의 스프레드시트를 열 수 없습니다. 주소의 ID 를 다시 확인해 주세요.');
    }
  }

  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  // 동시에 두 번 만들지 않도록 (첫 요청이 겹칠 때)
  var lock = LockService.getUserLock();
  try { lock.waitLock(20000); } catch (err) {}
  try {
    id = props.getProperty('SHEET_ID');
    if (id) return SpreadsheetApp.openById(id);
    var made = SpreadsheetApp.create('우리 반 게임 아케이드 (작품 보관소)');
    props.setProperty('SHEET_ID', made.getId());
    return made;
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

function metaSheet_() {
  var ss = book_();
  var sh = ss.getSheetByName(META_SHEET);
  if (!sh) sh = ss.insertSheet(META_SHEET, 0);
  if (sh.getLastRow() === 0) {
    sh.appendRow(META_HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, META_HEADERS.length).setFontWeight('bold').setBackground('#E6EAF2');
    sh.setColumnWidth(1, 150);   // ID
    sh.setColumnWidth(5, 220);   // 제목
    sh.setColumnWidth(7, 300);   // 설명
    sh.setColumnWidth(11, 90);   // 썸네일 (긴 문자열이라 좁게)
  }
  return sh;
}

function dataSheet_() {
  var ss = book_();
  var sh = ss.getSheetByName(DATA_SHEET);
  if (!sh) sh = ss.insertSheet(DATA_SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(DATA_HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, DATA_HEADERS.length).setFontWeight('bold').setBackground('#E6EAF2');
    sh.setColumnWidth(4, 90);
  }
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/* 긴 문자열을 CHUNK 글자씩 잘라 «작품데이터» 에 여러 줄로 저장 */
function writeBlob_(id, kind, text) {
  text = String(text || '');
  if (!text) return;
  var sh = dataSheet_();
  var rows = [];
  for (var i = 0, seq = 0; i < text.length; i += CHUNK, seq++) {
    rows.push([id, kind, seq, text.substr(i, CHUNK)]);
  }
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
}

/* 흩어진 조각을 순번대로 다시 이어 붙인다 */
function readBlob_(id, kind) {
  var sh = dataSheet_();
  var last = sh.getLastRow();
  if (last < 2) return '';

  // 내용(4열)은 건드리지 않고 ID/종류/순번만 훑어서 필요한 줄만 찾는다 — 메모리 절약
  var keys = sh.getRange(2, 1, last - 1, 3).getValues();
  var hits = [];
  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i][0]) === id && String(keys[i][1]) === kind) {
      hits.push({ row: i + 2, seq: Number(keys[i][2]) || 0 });
    }
  }
  if (!hits.length) return '';
  hits.sort(function (a, b) { return a.seq - b.seq; });

  var out = [];
  var contiguous = (hits[hits.length - 1].row - hits[0].row) === (hits.length - 1);
  if (contiguous) {
    var vals = sh.getRange(hits[0].row, 4, hits.length, 1).getValues();
    for (var j = 0; j < vals.length; j++) out.push(String(vals[j][0]));
  } else {
    for (var k = 0; k < hits.length; k++) out.push(String(sh.getRange(hits[k].row, 4).getValue()));
  }
  return out.join('');
}

/* 관리자 열쇠 확인 — 스크립트 속성에 ADMIN_KEY 를 넣어 두지 않으면 아무도 못 지운다 */
function adminOk_(key) {
  var want = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!want) return false;
  return String(key || '') === String(want);
}

/* 한 작품을 통째로 지운다 (목록 한 줄 + 흩어진 조각들) */
function deleteGame_(id) {
  var sh = metaSheet_();
  var row = findRow_(id);
  if (row > 0) sh.deleteRow(row);

  var ds = dataSheet_();
  var last = ds.getLastRow();
  if (last < 2) return;
  var ids = ds.getRange(2, 1, last - 1, 1).getValues();

  // 뒤에서부터 지워야 남은 줄 번호가 밀리지 않는다. 붙어 있는 줄은 한 번에 지운다.
  var run = 0;
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]) === id) {
      run++;
    } else if (run) {
      ds.deleteRows(i + 3, run);
      run = 0;
    }
  }
  if (run) ds.deleteRows(2, run);
}

/* ID 로 «아케이드» 시트의 줄 번호 찾기 (없으면 -1) */
function findRow_(id) {
  var sh = metaSheet_();
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) return i + 2;
  }
  return -1;
}

function clean_(v, n) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n);
}

/* ───────────────────────────────────────────────
   읽기
     ?mode=list            목록 (썸네일까지, 코드는 빼고)
     ?mode=game&id=xxx     한 편의 게임 코드 + 원본 포스터
   ─────────────────────────────────────────────── */
function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    var mode = p.mode || 'list';

    if (mode === 'info') {
      var ss = book_();
      return json_({
        ok: true,
        sheetName: ss.getName(),
        sheetUrl: ss.getUrl(),
        adminKeySet: !!PropertiesService.getScriptProperties().getProperty('ADMIN_KEY')
      });
    }

    if (mode === 'game') {
      var id = clean_(p.id, 60);
      if (!id) return json_({ ok: false, error: 'no id' });
      if (findRow_(id) < 0) return json_({ ok: false, error: 'not found' });
      return json_({
        ok: true,
        id: id,
        code: readBlob_(id, 'code'),
        poster: readBlob_(id, 'poster')
      });
    }

    var admin = adminOk_(p.admin);
    var sh = metaSheet_();
    var last = sh.getLastRow();
    var games = [];
    if (last >= 2) {
      var vals = sh.getRange(2, 1, last - 1, META_HEADERS.length).getValues();
      for (var i = 0; i < vals.length; i++) {
        var r = vals[i];
        if (!String(r[0]).trim()) continue;
        var isHidden = String(r[9]).trim() === '숨김';
        if (isHidden && !admin) continue;                 // 선생님이 내린 작품
        games.push({
          hidden: isHidden,
          id: String(r[0]),
          createdAt: r[1] ? new Date(r[1]).getTime() : 0,
          author: String(r[2] || ''),
          gradeClass: String(r[3] || ''),
          title: String(r[4] || ''),
          category: String(r[5] || 'cooking'),
          description: String(r[6] || ''),
          likes: Number(r[7]) || 0,
          plays: Number(r[8]) || 0,
          thumb: String(r[10] || '')
        });
      }
    }
    return json_({ ok: true, now: new Date().getTime(), admin: admin, games: games });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ───────────────────────────────────────────────
   쓰기  (본문 JSON 의 action 으로 갈린다)
     submit  새 게임 등록
     like    좋아요 +1 / -1
     play    플레이 횟수 +1
   ─────────────────────────────────────────────── */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
  } catch (err) {
    return json_({ ok: false, error: 'busy' });
  }
  try {
    var d = JSON.parse(e.postData.contents);
    var action = String(d.action || 'submit');

    if (action === 'hide' || action === 'show' || action === 'delete') {
      if (!adminOk_(d.key)) return json_({ ok: false, error: '관리자 암호가 맞지 않습니다.' });
      var gid = clean_(d.id, 60);
      if (findRow_(gid) < 0) return json_({ ok: false, error: 'not found' });
      if (action === 'delete') {
        deleteGame_(gid);
      } else {
        metaSheet_().getRange(findRow_(gid), 10).setValue(action === 'hide' ? '숨김' : '');
      }
      return json_({ ok: true });
    }

    if (action === 'like' || action === 'play') {
      var id = clean_(d.id, 60);
      var row = findRow_(id);
      if (row < 0) return json_({ ok: false, error: 'not found' });
      var col = action === 'like' ? 8 : 9;
      var cell = metaSheet_().getRange(row, col);
      var next = (Number(cell.getValue()) || 0) + (action === 'like' ? (d.delta < 0 ? -1 : 1) : 1);
      if (next < 0) next = 0;
      cell.setValue(next);
      return json_({ ok: true, value: next });
    }

    /* ── 새 게임 등록 ── */
    var sh = metaSheet_();
    if (sh.getLastRow() - 1 >= MAX_GAMES) {
      return json_({ ok: false, error: '등록할 수 있는 작품 수를 넘었습니다. 선생님께 말씀드리세요.' });
    }

    var title  = clean_(d.title, 80);
    var author = clean_(d.author, 30);
    var code   = String(d.code || '');
    var poster = String(d.poster || '');
    var thumb  = String(d.thumb || '');

    if (!title || !author) return json_({ ok: false, error: '이름과 제목은 꼭 넣어 주세요.' });
    if (!code.trim())      return json_({ ok: false, error: '게임 코드가 비어 있습니다.' });
    if (code.length > MAX_BLOB)   return json_({ ok: false, error: '게임 코드가 너무 깁니다.' });
    if (poster.length > MAX_BLOB) return json_({ ok: false, error: '포스터 사진이 너무 큽니다.' });
    if (thumb.length > MAX_THUMB) return json_({ ok: false, error: '포스터 미리보기가 너무 큽니다.' });

    var id = 'g' + new Date().getTime() + Math.floor(Math.random() * 1000);

    sh.appendRow([
      id,
      new Date(),
      author,
      clean_(d.gradeClass, 30),
      title,
      clean_(d.category, 20) || 'cooking',
      clean_(d.description, 300),
      1,   // 좋아요
      0,   // 플레이
      '',  // 상태 (선생님이 "숨김" 이라고 적으면 목록에서 빠집니다)
      thumb
    ]);

    writeBlob_(id, 'code', code);
    if (poster && poster.indexOf('http') !== 0) writeBlob_(id, 'poster', poster);

    return json_({ ok: true, id: id });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
