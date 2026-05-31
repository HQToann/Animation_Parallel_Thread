/* ============================================================
   ANIMATION: ĐỒNG BỘ HÓA LUỒNG - PYTHON THREADING
   Đã sửa: logic đúng lý thuyết, hiển thị tên hàm thời gian thực,
   Event chỉ giữ Producer-Consumer theo slide, lặp vô tận mượt mà.
   ============================================================ */

let mode = 'lock';
let autoTimer;
let frame = 0;
let isPaused = false;
const screen = document.getElementById('sim-screen');

/* ---- Helpers ---- */
function createBlock(id, cls, text, style) {
    // Thêm transition 0.8s để các khối di chuyển nhanh hơn một chút
    let fastStyle = `transition: all 0.8s ease; ${style || ''}`;
    return `<div class="obj ${cls}" id="${id}" style="${fastStyle}">${text}<div class="tag" id="tag-${id}"></div></div>`;
}

function move(id, left, top) {
    let el = document.getElementById(id);
    if (!el) return;
    if (left !== undefined && left !== null) el.style.left = left;
    if (top  !== undefined && top  !== null) el.style.top  = top;
}

/* showTag: hiển thị tên hàm / trạng thái ngay trên khối */
function showTag(id, text, type) {
    let tag = document.getElementById('tag-' + id);
    if (!tag) return;
    tag.innerHTML = text;
    tag.className = 'tag show';
    tag.style.color = type === 'err' ? '#e84118'
                    : type === 'ok'  ? '#4cd137'
                    : type === 'fn'  ? '#00d2d3'   /* màu cyan cho tên hàm */
                    : '#f1c40f';
}
/* alias tương thích với tên cũ */
function setTag(id, text, type) { showTag(id, text, type); }

function clearTag(id) {
    let tag = document.getElementById('tag-' + id);
    if (tag) { tag.className = 'tag'; tag.innerHTML = ''; }
}

function setDim(id, isDim) {
    let el = document.getElementById(id);
    if (el) isDim ? el.classList.add('dim') : el.classList.remove('dim');
}

function setLock(id, isLocked) {
    let el = document.getElementById(id);
    if (el) isLocked ? el.classList.add('locked') : el.classList.remove('locked');
}

function updateHud(text) {
    let hud = document.getElementById('hud');
    if (hud) hud.innerText = text;
}

/* breathe: tạo khoảng nghỉ nhẹ bằng cách dừng interval rồi tiếp tục sau delay */
function breathe(ms) {
    clearInterval(autoTimer);
    if (!isPaused) {
        setTimeout(() => {
            if (!isPaused) {
                autoTimer = setInterval(runVideoFrame, 2200);
            }
        }, ms);
    }
}

/* nextLoop: reset frame về 0 rồi delay trước khi lặp lại. */
function nextLoop() {
    clearInterval(autoTimer);
    setTimeout(() => {
        softReset();
        if (!isPaused) {
            frame = 0;
            autoTimer = setInterval(runVideoFrame, 2200);
        }
    }, 2000);
}

/* softReset: đặt lại vị trí / trạng thái mà KHÔNG rebuild HTML */
function softReset() {
    frame = 0;
    if (mode === 'thread') {
        move('t1', '-150px', '120px'); clearTag('t1');
        move('t2', '-150px', '220px'); clearTag('t2');
        move('t3', '-150px', '320px'); clearTag('t3');
        ['t1','t2','t3'].forEach(id => {
            let el = document.getElementById(id);
            // Giảm từ 1.8s xuống 1.0s để đồng bộ tốc độ di chuyển
            if (el) { el.style.transitionDuration = '1.0s'; el.classList.remove('dim'); }
        });
    }
    else if (mode === 'lock') {
        move('t1', '-150px', '180px'); clearTag('t1'); setDim('t1', false);
        move('t2', '-150px', '260px'); clearTag('t2'); setDim('t2', false);
        move('t3', '-150px', '340px'); clearTag('t3'); setDim('t3', false);
        setLock('zone', false); clearTag('zone');
        let t3El = document.getElementById('t3');
        if (t3El) { t3El.style.boxShadow = ''; t3El.style.borderColor = ''; }
        let hud = document.getElementById('hud');
        if (hud) { hud.style.display = 'none'; }
    }
    else if (mode === 'rlock') {
        move('t1', '-150px', '220px'); clearTag('t1'); setDim('t1', false);
        setLock('z-out', false); clearTag('z-out');
        setLock('z-in',  false); clearTag('z-in');
        updateHud('Mức khóa: 0');
    }
    else if (mode === 'semaphore') {
        move('t1', '-150px', '90px');  clearTag('t1'); setDim('t1', false);
        move('t2', '-150px', '210px'); clearTag('t2'); setDim('t2', false);
        move('t3', '-150px', '330px'); clearTag('t3'); setDim('t3', false);
        move('t4', '-150px', '400px'); clearTag('t4'); setDim('t4', false);
        ['s1','s2','s3'].forEach(id => { setLock(id, false); clearTag(id); });
        updateHud('Chỗ trống: 3');
        let hud = document.getElementById('hud');
        if (hud) hud.style.color = '#4cd137';
    }
    else if (mode === 'condition') {
        move('c', '-150px', '175px'); clearTag('c'); setDim('c', false);
        move('p', '-150px', '265px'); clearTag('p'); setDim('p', false);
        let item = document.getElementById('item');
        if (item) item.style.opacity = 0;
        let zone = document.getElementById('zone');
        if (zone) { zone.style.background = 'rgba(127, 143, 166, 0.1)'; clearTag('zone'); }
    }
    else if (mode === 'event') {
        move('cons', '-150px', '265px'); clearTag('cons'); setDim('cons', false);
        move('prod', '-150px', '175px'); clearTag('prod'); setDim('prod', false);
        let di = document.getElementById('data-item');
        if (di) di.style.opacity = 0;
        let buf = document.getElementById('buffer');
        if (buf) buf.style.background = 'rgba(127, 143, 166, 0.1)';
        let sig = document.getElementById('signal-status');
        if (sig) { sig.innerText = 'Event Flag: False'; sig.style.color = '#f1c40f'; sig.style.borderColor = '#f1c40f'; }
        let lk = document.getElementById('lock-status');
        if (lk) { lk.innerText = 'Trạng thái Lock: Mở'; lk.style.color = '#3498db'; lk.style.borderColor = '#3498db'; }
    }
    else if (mode === 'race') {
        move('t1', '-150px', '180px'); clearTag('t1'); setDim('t1', false);
        move('t2', '1050px', '180px'); clearTag('t2'); setDim('t2', false);
        setTag('db', ''); setDim('db', false);
        let db = document.getElementById('db');
        if (db) { db.style.borderColor = ''; db.style.background = ''; }
        updateHud('Mục tiêu: Nạp 2 lần 500$ = 2000$');
        let hud = document.getElementById('hud');
        if (hud) hud.style.color = '#fbc531';
    }
    else if (mode === 'deadlock') {
        move('t1', '-150px', '190px'); clearTag('t1'); setDim('t1', false);
        move('t2', '1050px', '190px'); clearTag('t2'); setDim('t2', false);
        setLock('z1', false); clearTag('z1');
        setLock('z2', false); clearTag('z2');
        updateHud('Trạng thái: Hoạt động');
        let hud = document.getElementById('hud');
        if (hud) hud.style.color = '#4cd137';
    }
}

/* ---- Pause / Resume ---- */
function togglePause() {
    isPaused = !isPaused;
    const btn   = document.getElementById('btn-pause');
    const badge = document.getElementById('status-badge');
    if (isPaused) {
        clearInterval(autoTimer);
        btn.innerHTML = 'Tiếp tục';
        btn.classList.add('paused');
        badge.innerHTML = 'Đã tạm dừng';
        badge.style.background = '#e84118';
        badge.style.animation = 'none';
    } else {
        autoTimer = setInterval(runVideoFrame, 2200);
        btn.innerHTML = 'Tạm dừng';
        btn.classList.remove('paused');
        badge.innerHTML = 'Đang chạy...';
        badge.style.background = '#4cd137';
        badge.style.animation = 'pulse 2s infinite';
    }
}

/* ---- initSim: xây dựng HTML, sau đó chạy ---- */
function initSim() {
    clearInterval(autoTimer);
    mode  = document.getElementById('sim-select').value;
    frame = 0;
    isPaused = false;

    const btn   = document.getElementById('btn-pause');
    const badge = document.getElementById('status-badge');
    if (btn && badge) {
        btn.innerHTML = 'Tạm dừng';
        btn.classList.remove('paused');
        badge.innerHTML = 'Đang chạy...';
        badge.style.background = '#4cd137';
        badge.style.animation = 'pulse 2s infinite';
    }

    let html = `<div class="title-box" id="title"></div><div class="hud-box" id="hud"></div>`;

    if (mode === 'thread') {
        html += `<div class="lane" style="top:150px;"></div>
                 <div class="lane" style="top:250px;"></div>
                 <div class="lane" style="top:350px;"></div>`;
        html += createBlock('t1','thread t-a','Main','top:120px;left:-150px;');
        html += createBlock('t2','thread t-b','T1',  'top:220px;left:-150px;');
        html += createBlock('t3','thread t-c','T2',  'top:320px;left:-150px;');
    }
    else if (mode === 'lock') {
        html += createBlock('zone','zone','Tài Nguyên','width:220px;height:160px;top:170px;left:550px;');
        html += createBlock('t1','thread t-a','A','top:180px;left:-150px;');
        html += createBlock('t2','thread t-b','B','top:260px;left:-150px;');
        html += createBlock('t3','thread t-c','C','top:340px;left:-150px;');
    }
    else if (mode === 'rlock') {
        html += createBlock('z-out','zone','Hàm Ngoài','width:340px;height:260px;top:120px;left:450px;');
        html += createBlock('z-in', 'zone','Hàm Trong','width:140px;height:100px;top:200px;left:620px;');
        html += createBlock('t1','thread t-b','A','top:220px;left:-150px;');
    }
    else if (mode === 'semaphore') {
        html += createBlock('s1','zone','Slot 1','width:120px;height:80px;top:80px;left:650px;');
        html += createBlock('s2','zone','Slot 2','width:120px;height:80px;top:200px;left:650px;');
        html += createBlock('s3','zone','Slot 3','width:120px;height:80px;top:320px;left:650px;');
        html += createBlock('t1','thread t-a','T1','top:90px;left:-150px;');
        html += createBlock('t2','thread t-b','T2','top:210px;left:-150px;');
        html += createBlock('t3','thread t-c','T3','top:330px;left:-150px;');
        html += createBlock('t4','thread t-d','T4','top:400px;left:-150px;');
    }
    else if (mode === 'condition') {
        html += createBlock('zone','zone','Bộ Đệm (Buffer)','width:250px;height:180px;top:160px;left:550px;');
        html += `<div class="obj icon" id="item" style="transition: all 0.8s ease; top:225px;left:650px;opacity:0;font-size:50px;">📦</div>`;
        html += createBlock('c','thread t-b','Khách','top:175px;left:-150px;');
        html += createBlock('p','thread t-a','Thợ',  'top:265px;left:-150px;');
    }
    else if (mode === 'event') {
        /* Producer-Consumer theo đúng slide bài giảng */
        html += createBlock('buffer','zone','Bộ Đệm','width:280px;height:180px;top:160px;left:500px;');
        html += `<div class="obj icon" id="data-item" style="transition: all 0.8s ease; top:225px;left:615px;opacity:0;font-size:50px;z-index:15;">📦</div>`;
        /* Thanh trạng thái */
        html += `<div class="tag show" id="lock-status"   style="top:20px;left:420px;font-size:14px;border:2px solid #3498db;color:#3498db;z-index:100;padding:6px 12px;transition:0.3s;">Trạng thái Lock: Mở</div>`;
        html += `<div class="tag show" id="signal-status" style="top:20px;left:650px;font-size:14px;border:2px solid #f1c40f;color:#f1c40f;z-index:100;padding:6px 12px;transition:0.3s;">Event Flag: False</div>`;
        html += createBlock('cons','thread t-b','Khách','top:265px;left:-150px;');
        html += createBlock('prod','thread t-a','Thợ',  'top:175px;left:-150px;');
    }
    else if (mode === 'race') {
        html += createBlock('db','zone','Tài Khoản Chung','width:240px;height:120px;top:150px;left:330px;');
        html += createBlock('t1','thread t-a','Luồng 1','top:180px;left:-150px;');
        html += createBlock('t2','thread t-b','Luồng 2','top:180px;left:1050px;');
    }
    else if (mode === 'deadlock') {
        html += createBlock('z1','zone','Tài Nguyên 1','width:200px;height:140px;top:150px;left:150px;');
        html += createBlock('z2','zone','Tài Nguyên 2','width:200px;height:140px;top:150px;left:550px;');
        html += createBlock('t1','thread t-a','T1','top:190px;left:-150px;');
        html += createBlock('t2','thread t-b','T2','top:190px;left:1050px;');
    }

    screen.innerHTML = html;

    /* Title + HUD */
    const t = document.getElementById('title');
    const h = document.getElementById('hud');
    if (mode === 'thread')     { t.innerText = '1. Threading Module'; }
    if (mode === 'lock')       { t.innerText = '2. Lock'; }
    if (mode === 'rlock')      { t.innerText = '3. RLock (Reentrant Lock)'; h.style.display='block'; h.innerText='Mức khóa: 0'; }
    if (mode === 'semaphore')  { t.innerText = '4. Semaphore'; h.style.display='block'; h.innerText='Chỗ trống: 3'; h.style.color='#4cd137'; }
    if (mode === 'condition')  { t.innerText = '5. Condition Variable'; }
    if (mode === 'event')      { t.innerText = '6. Event (Producer-Consumer)'; }
    if (mode === 'race')       { t.innerText = '7. Race Condition (Ví dụ nạp tiền)'; h.style.display='block'; h.innerText='Mục tiêu: Nạp 2 lần 500$ = 2000$'; h.style.color='#fbc531'; }
    if (mode === 'deadlock')   { t.innerText = '8. Deadlock (Bế tắc vòng tròn)'; h.style.display='block'; h.innerText='Trạng thái: Hoạt động'; h.style.color='#4cd137'; }

    setTimeout(() => {
        if (!isPaused) {
            runVideoFrame();
            autoTimer = setInterval(runVideoFrame, 2200);
        }
    }, 80);
}

/* ================================================================
   runVideoFrame — chạy từng khung hình theo frame++
   Tất cả tên hàm Python hiển thị bằng showTag(..., 'fn')
   ================================================================ */
function runVideoFrame() {
    frame++;

    /* ----------------------------------------------------------
       1. THREAD — minh họa luồng chạy song song
       ---------------------------------------------------------- */
    if (mode === 'thread') {
        if (frame === 1) {
            showTag('t1', 'import threading', 'fn');
            move('t1', '80px');
        }
        if (frame === 2) {
            /* Main spawn T1 và T2 */
            showTag('t1', 'Thread(target=func).start()', 'fn');
            move('t1', '280px');
        }
        if (frame === 3) {
            showTag('t2', 'Thread(target=func).start()', 'fn');
            move('t2', '280px');
            showTag('t3', 'Thread(target=func).start()', 'fn');
            move('t3', '280px');
        }
        if (frame === 5) {
            /* Các luồng chạy song song với tốc độ khác nhau */
            showTag('t1', 'Thực thi song song...', 'ok');
            showTag('t2', 'Thực thi song song...', 'ok');
            showTag('t3', 'Thực thi song song...', 'ok');
        }
        if (frame === 7) {
            showTag('t1', 't.join()  ← chờ kết thúc', 'fn');
            let e1 = document.getElementById('t1');
            let e2 = document.getElementById('t2');
            let e3 = document.getElementById('t3');
            // Đã giảm thông số thời gian di chuyển đi một chút
            if (e1) e1.style.transitionDuration = '1.8s';
            if (e2) e2.style.transitionDuration = '1.0s';
            if (e3) e3.style.transitionDuration = '2.5s';
            move('t1', '1000px'); move('t2', '1000px'); move('t3', '1000px');
        }
        if (frame === 11) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       2. LOCK — xin khóa / bị chặn / nhả khóa / RuntimeError
       ---------------------------------------------------------- */
    else if (mode === 'lock') {
        /* Luồng A vào trước */
        if (frame === 1)  { move('t1', '400px'); showTag('t1', 'Tiến đến tài nguyên...'); }
        if (frame === 2)  { move('t1', '630px', '210px'); setLock('zone', true); showTag('t1', 'lock.acquire()', 'fn'); showTag('zone', 'Đang khóa 🔒', 'err'); }

        /* Luồng B đến sau — bị chặn */
        if (frame === 4)  { move('t2', '400px'); showTag('t2', 'lock.acquire() → Blocked', 'err'); }
        if (frame === 5)  { setDim('t2', true); showTag('t2', '⏳ Đang chờ...', 'err'); }

        /* Luồng A nhả khóa */
        if (frame === 7)  { move('t1', '1000px'); setLock('zone', false); showTag('t1', 'lock.release()', 'fn'); showTag('zone', 'Mở khóa 🔓', 'ok'); breathe(900); }

        /* Luồng B thức dậy, vào chiếm khóa */
        if (frame === 8)  { setDim('t2', false); move('t2', '630px', '210px'); showTag('t2', 'lock.acquire()', 'fn'); setLock('zone', true); showTag('zone', 'Đang khóa 🔒', 'err'); }
        if (frame === 10) { move('t2', '1000px'); showTag('t2', 'lock.release()', 'fn'); setLock('zone', false); clearTag('zone'); breathe(900); }

        /* Luồng C gây lỗi: release() khi chưa acquire() */
        if (frame === 12) { move('t3', '400px'); showTag('t3', 'Chưa acquire() ...'); }
        if (frame === 14) { showTag('t3', 'lock.release()', 'err'); }
        if (frame === 15) {
            showTag('t3', '❌ RuntimeError!', 'err');
            setDim('t3', true);
            let t3El = document.getElementById('t3');
            if (t3El) { t3El.style.boxShadow = '0 0 20px #e84118'; t3El.style.borderColor = '#e84118'; }
            updateHud('Lỗi: release() khi chưa acquire()!');
            let hud = document.getElementById('hud');
            if (hud) { hud.style.display = 'block'; hud.style.color = '#e84118'; }
        }
        if (frame === 20) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       3. RLOCK — Reentrant: cùng 1 luồng acquire() nhiều lần
       ---------------------------------------------------------- */
    else if (mode === 'rlock') {
        if (frame === 1) { move('t1', '350px'); showTag('t1', 'Bắt đầu chạy...'); }

        /* Lần acquire() đầu — vào Hàm Ngoài */
        if (frame === 2) {
            move('t1', '480px');
            setLock('z-out', true);
            updateHud('Mức khóa: 1');
            showTag('z-out', 'Đang giữ (lần 1)', 'err');
            showTag('t1', 'rlock.acquire()  ← lần 1', 'fn');
        }

        /* Lần acquire() thứ 2 — vào Hàm Trong (đệ quy) */
        if (frame === 4) {
            move('t1', '655px');
            setLock('z-in', true);
            updateHud('Mức khóa: 2');
            showTag('z-in', 'Đang giữ (lần 2)', 'err');
            showTag('t1', 'rlock.acquire()  ← lần 2 (đệ quy)', 'fn');
            breathe(700);
        }

        /* release() lần 1 — thoát Hàm Trong */
        if (frame === 6) {
            move('t1', '490px');
            setLock('z-in', false);
            clearTag('z-in');
            updateHud('Mức khóa: 1');
            showTag('t1', 'rlock.release()  ← lần 1', 'fn');
            breathe(700);
        }

        /* release() lần 2 — thoát Hàm Ngoài, unlocked hoàn toàn */
        if (frame === 8) {
            move('t1', '1000px');
            setLock('z-out', false);
            clearTag('z-out');
            updateHud('Mức khóa: 0  (Unlocked)');
            showTag('t1', 'rlock.release()  ← lần 2', 'fn');
        }
        if (frame === 12) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       4. SEMAPHORE — biến đếm giới hạn 3 slot, T4 bị chặn
       ---------------------------------------------------------- */
    else if (mode === 'semaphore') {
        /* T1 xin slot 1 */
        if (frame === 1)  { move('t1', '450px', '90px');  showTag('t1', 'sem.acquire()  ← count--', 'fn'); }
        if (frame === 2)  { move('t1', '660px', '90px');  setLock('s1', true); updateHud('Chỗ trống: 2'); document.getElementById('hud').style.color = '#fbc531'; showTag('t1', 'Đã chiếm Slot 1 ✓', 'ok'); showTag('s1', 'count=2', 'err'); }

        /* T2 xin slot 2 */
        if (frame === 3)  { move('t2', '450px', '210px'); showTag('t2', 'sem.acquire()  ← count--', 'fn'); }
        if (frame === 4)  { move('t2', '660px', '210px'); setLock('s2', true); updateHud('Chỗ trống: 1'); showTag('t2', 'Đã chiếm Slot 2 ✓', 'ok'); showTag('s2', 'count=1', 'err'); }

        /* T3 xin slot 3 */
        if (frame === 5)  { move('t3', '450px', '330px'); showTag('t3', 'sem.acquire()  ← count--', 'fn'); }
        if (frame === 6)  { move('t3', '660px', '330px'); setLock('s3', true); updateHud('Chỗ trống: 0'); document.getElementById('hud').style.color = '#e84118'; showTag('t3', 'Đã chiếm Slot 3 ✓', 'ok'); showTag('s3', 'count=0', 'err'); }

        /* T4 đến — count=0 → BLOCKED */
        if (frame === 7)  { move('t4', '450px', '400px'); showTag('t4', 'sem.acquire()  ← count=0', 'fn'); }
        if (frame === 8)  { setDim('t4', true); showTag('t4', '⏳ Blocked! Chờ release()...', 'err'); }

        /* T1 xong việc, gọi release() */
        if (frame === 10) { move('t1', '1000px', '90px'); setLock('s1', false); clearTag('s1'); updateHud('Chỗ trống: 1'); document.getElementById('hud').style.color = '#fbc531'; showTag('t1', 'sem.release()  ← count++', 'fn'); breathe(900); }

        /* T4 thoát blocked, chiếm Slot 1 */
        if (frame === 11) { setDim('t4', false); clearTag('t4'); move('t4', '660px', '90px'); setLock('s1', true); updateHud('Chỗ trống: 0'); document.getElementById('hud').style.color = '#e84118'; showTag('t4', 'Chiếm Slot 1 ✓ (sau khi T1 release)', 'ok'); showTag('s1', 'count=0', 'err'); }

        if (frame === 15) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       5. CONDITION — Producer/Consumer với notify()
       ---------------------------------------------------------- */
    else if (mode === 'condition') {
        /* Consumer đến trước — buffer trống → wait() */
        if (frame === 1)  { move('c', '400px'); showTag('c', 'cond.acquire()', 'fn'); }
        if (frame === 2)  { showTag('zone', 'Buffer trống!', 'err'); showTag('c', 'cond.wait()  ← nhả khóa & ngủ', 'err'); }
        if (frame === 3)  { setDim('c', true); clearTag('zone'); }

        /* Producer vào — ghi dữ liệu */
        if (frame === 5)  { move('p', '400px');      showTag('p', 'cond.acquire()', 'fn'); }
        if (frame === 6)  { move('p', '645px', '220px'); showTag('p', 'Ghi dữ liệu vào Buffer...', 'ok'); }
        if (frame === 7)  {
            document.getElementById('item').style.opacity = 1;
            document.getElementById('zone').style.background = 'rgba(76, 209, 55, 0.2)';
            showTag('zone', 'Có dữ liệu! 📦');
            showTag('p', 'cond.notify()  ← đánh thức Consumer', 'fn');
            breathe(800);
        }

        /* Consumer thức dậy nhưng chưa vào — phải chờ Producer release */
        if (frame === 9)  { setDim('c', false); showTag('c', '⏳ Thức dậy, chờ acquire()...', 'ok'); breathe(700); }

        /* Producer nhả khóa */
        if (frame === 11) { move('p', '1000px'); showTag('p', 'cond.release()  ← nhả khóa', 'fn'); }

        /* Consumer chiếm khóa, lấy đồ */
        if (frame === 12) { move('c', '645px', '220px'); showTag('c', 'cond.acquire()  ← đã được vào', 'fn'); }
        if (frame === 13) {
            document.getElementById('item').style.opacity = 0;
            showTag('c', 'Lấy dữ liệu ✓');
        }
        if (frame === 15) {
            move('c', '1000px');
            showTag('c', 'cond.release()', 'fn');
            showTag('zone', 'Buffer trống');
            document.getElementById('zone').style.background = 'rgba(127, 143, 166, 0.1)';
        }
        if (frame === 18) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       6. EVENT — Producer-Consumer theo ĐÚNG slide bài giảng
          Cờ False ban đầu. Consumer bị block.
          Producer ghi xong → set() (True).
          Consumer thoát wait(), lấy dữ liệu.
          Producer gọi clear() → False (reset vòng lặp).
       ---------------------------------------------------------- */
    else if (mode === 'event') {
        let sigStatus = document.getElementById('signal-status');
        let buf       = document.getElementById('buffer');
        let dataItem  = document.getElementById('data-item');
        let lockStatus = document.getElementById('lock-status');

        /* Bước 1: Consumer vào, gọi wait() — Flag=False → bị block */
        if (frame === 1) {
            move('cons', '320px');
            showTag('cons', 'event.wait()  ← Flag=False → Blocked', 'err');
        }
        if (frame === 3) {
            setDim('cons', true);
            if (lockStatus) { lockStatus.innerText = 'Trạng thái: Blocked'; lockStatus.style.color = '#e84118'; lockStatus.style.borderColor = '#e84118'; }
        }

        /* Bước 2: Producer tiến vào */
        if (frame === 5) {
            move('prod', '320px', '120px');
            showTag('prod', 'Chuẩn bị ghi dữ liệu...', 'ok');
        }

        /* Bước 3: Producer ghi dữ liệu vào Buffer */
        if (frame === 7) {
            move('prod', '615px', '220px');
            showTag('prod', 'Ghi dữ liệu vào Bộ Đệm 📦');
        }
        if (frame === 9) {
            if (dataItem) dataItem.style.opacity = 1;
            if (buf)      buf.style.background = 'rgba(76, 209, 55, 0.2)';
            showTag('prod', 'Ghi xong! ✓', 'ok');
        }

        /* Bước 4: Producer gọi event.set() → Flag = True */
        if (frame === 11) {
            showTag('prod', 'event.set()  ← Flag = True', 'fn');
            if (sigStatus) { sigStatus.innerText = 'Event Flag: True ✓'; sigStatus.style.color = '#4cd137'; sigStatus.style.borderColor = '#4cd137'; }
            breathe(900);
        }
        /* Consumer nhận tín hiệu — frame riêng để không chồng lên Producer */
        if (frame === 12) {
            setDim('cons', false);
            showTag('cons', '🔔 Nhận tín hiệu! Thoát wait()', 'ok');
            if (lockStatus) { lockStatus.innerText = 'Trạng thái: Hoạt động'; lockStatus.style.color = '#4cd137'; lockStatus.style.borderColor = '#4cd137'; }
        }

        /* Bước 5: Producer lui ra, gọi event.clear() — chờ Consumer đã nhận xong */
        if (frame === 14) {
            move('prod', '320px', '120px');
            showTag('prod', 'event.clear()  ← Flag = False', 'fn');
            if (sigStatus) { sigStatus.innerText = 'Event Flag: False'; sigStatus.style.color = '#f1c40f'; sigStatus.style.borderColor = '#f1c40f'; }
            breathe(800);
        }

        /* Bước 6: Consumer vào Buffer lấy dữ liệu — sau khi Producer đã lui */
        if (frame === 16) {
            move('cons', '615px', '270px');
            showTag('cons', 'Lấy dữ liệu ra xử lý...');
        }
        if (frame === 18) {
            if (dataItem) dataItem.style.opacity = 0;
            if (buf)      buf.style.background = 'rgba(127, 143, 166, 0.1)';
            showTag('cons', 'Xử lý xong ✓', 'ok');
        }

        /* Bước 7: Consumer rời đi */
        if (frame === 20) {
            move('cons', '1000px', '270px');
            showTag('cons', 'Hoàn thành');
            move('prod', '1000px', '120px');
            showTag('prod', 'Nghỉ (Sleep)');
            if (lockStatus) { lockStatus.innerText = 'Trạng thái Lock: Mở'; lockStatus.style.color = '#3498db'; lockStatus.style.borderColor = '#3498db'; }
        }

        if (frame === 24) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       7. RACE CONDITION — 2 luồng đọc-ghi không đồng bộ
       ---------------------------------------------------------- */
    else if (mode === 'race') {
        if (frame === 1)  { move('t1', '240px'); move('t2', '600px'); showTag('db', 'Số dư GỐC: 1000$'); }

        /* Cả 2 đọc cùng một lúc (giá trị cũ) */
        if (frame === 3)  { showTag('t1', 'Đọc số dư: 1000$  ← READ'); }
        if (frame === 4)  { showTag('t2', 'Đọc số dư: 1000$  ← READ'); }

        /* Luồng 1 tính và ghi */
        if (frame === 6)  { showTag('t1', 'Tính: 1000 + 500 = 1500'); }
        if (frame === 8)  {
            showTag('t1', 'WRITE: 1500$ ✓', 'ok');
            showTag('db', 'Số dư: 1500$', 'ok');
            move('t1', '240px', '100px');
        }

        /* Luồng 2 tính và GHI ĐÈ */
        if (frame === 10) { showTag('t2', 'Tính: 1000 + 500 = 1500  ← dùng GIÁ TRỊ CŨ!', 'err'); }
        if (frame === 12) {
            showTag('t2', 'WRITE: 1500$ ← GHI ĐÈ! ❌', 'err');
            showTag('db', 'Số dư: 1500$ (MẤT 500$!)', 'err');
            let db = document.getElementById('db');
            if (db) { db.style.borderColor = '#e84118'; db.style.background = 'rgba(232,65,24,0.15)'; }
            updateHud('❌ LỖI: Race Condition - Mất 500$!');
            document.getElementById('hud').style.color = '#e84118';
            move('t2', '600px', '260px');
        }
        if (frame === 17) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       8. DEADLOCK — T1 và T2 giữ tài nguyên, đòi ngược nhau
       ---------------------------------------------------------- */
    else if (mode === 'deadlock') {
        /* Cả hai tiến vào */
        if (frame === 1) { move('t1', '220px'); move('t2', '620px'); }

        /* Mỗi người chiếm 1 tài nguyên */
        if (frame === 3) {
            setLock('z1', true); showTag('t1', 'lock1.acquire() ✓', 'fn'); showTag('z1', 'T1 đang giữ 🔒', 'err');
            setLock('z2', true); showTag('t2', 'lock2.acquire() ✓', 'fn'); showTag('z2', 'T2 đang giữ 🔒', 'err');
        }

        /* T1 đòi tài nguyên 2 (đang do T2 giữ) */
        if (frame === 5) { move('t1', '450px'); showTag('t1', 'lock2.acquire() ← Muốn Tài Nguyên 2', 'fn'); }

        /* T2 đòi tài nguyên 1 (đang do T1 giữ) */
        if (frame === 7) { move('t2', '390px'); showTag('t2', 'lock1.acquire() ← Muốn Tài Nguyên 1', 'fn'); }

        /* Cả hai bị khóa chéo — DEADLOCK */
        if (frame === 9) {
            setDim('t1', true); showTag('t1', '⏳ Chờ T2 nhả... (mãi mãi)', 'err');
            setDim('t2', true); showTag('t2', '⏳ Chờ T1 nhả... (mãi mãi)', 'err');
        }
        if (frame === 11) {
            updateHud('💀 DEADLOCK! Treo vĩnh viễn');
            document.getElementById('hud').style.color = '#e84118';
            showTag('z1', '🔴 DEADLOCK', 'err');
            showTag('z2', '🔴 DEADLOCK', 'err');
        }
        if (frame === 17) { nextLoop(); }
    }
}

/* Khởi động lần đầu */
initSim();