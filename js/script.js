/* ============================================================
   ANIMATION: ĐỒNG BỘ HÓA LUỒNG - PYTHON THREADING
   Đã sửa: Thêm độ trễ (delay) khi gọi release()/clear()/join() 
   để người dùng kịp đọc tên hàm trước khi khối di chuyển.
   ============================================================ */

let mode = 'lock';
let autoTimer;
let frame = 0;
let isPaused = false;
const screen = document.getElementById('sim-screen');

/* ---- Helpers ---- */
function createBlock(id, cls, text, style) {
    let fastStyle = `transition: all 0.8s ease; ${style || ''}`;
    return `<div class="obj ${cls}" id="${id}" style="${fastStyle}">${text}<div class="tag" id="tag-${id}"></div></div>`;
}

function move(id, left, top) {
    let el = document.getElementById(id);
    if (!el) return;
    if (left !== undefined && left !== null) el.style.left = left;
    if (top  !== undefined && top  !== null) el.style.top  = top;
}

function showTag(id, text, type) {
    let tag = document.getElementById('tag-' + id);
    if (!tag) return;
    tag.innerHTML = text;
    tag.className = 'tag show';
    tag.style.color = type === 'err' ? '#e84118'
                    : type === 'ok'  ? '#4cd137'
                    : type === 'fn'  ? '#00d2d3'
                    : '#f1c40f';
}
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

function softReset() {
    frame = 0;
    if (mode === 'thread') {
        move('t1', '-150px', '120px'); clearTag('t1');
        move('t2', '-150px', '220px'); clearTag('t2');
        move('t3', '-150px', '320px'); clearTag('t3');
        ['t1','t2','t3'].forEach(id => {
            let el = document.getElementById(id);
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
        html += createBlock('buffer','zone','Bộ Đệm','width:280px;height:180px;top:160px;left:500px;');
        html += `<div class="obj icon" id="data-item" style="transition: all 0.8s ease; top:225px;left:615px;opacity:0;font-size:50px;z-index:15;">📦</div>`;
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
   ================================================================ */
function runVideoFrame() {
    frame++;

    /* ----------------------------------------------------------
       1. THREAD
       ---------------------------------------------------------- */
    if (mode === 'thread') {
        if (frame === 1) { showTag('t1', 'import threading', 'fn'); move('t1', '80px'); }
        if (frame === 2) { showTag('t1', 'Thread(target=func).start()', 'fn'); move('t1', '280px'); }
        if (frame === 3) {
            showTag('t2', 'Thread(target=func).start()', 'fn'); move('t2', '280px');
            showTag('t3', 'Thread(target=func).start()', 'fn'); move('t3', '280px');
        }
        if (frame === 5) {
            showTag('t1', 'Thực thi song song...', 'ok');
            showTag('t2', 'Thực thi song song...', 'ok');
            showTag('t3', 'Thực thi song song...', 'ok');
        }
        if (frame === 7) {
            showTag('t1', 't.join()  ← chờ kết thúc', 'fn');
            let e1 = document.getElementById('t1');
            let e2 = document.getElementById('t2');
            let e3 = document.getElementById('t3');
            if (e1) e1.style.transitionDuration = '1.8s';
            if (e2) e2.style.transitionDuration = '1.0s';
            if (e3) e3.style.transitionDuration = '2.5s';
            
            // Dừng 1.2s để hiện chữ t.join() rồi mới cho các khối đi
            setTimeout(() => { move('t1', '1000px'); move('t2', '1000px'); move('t3', '1000px'); }, 1200);
            breathe(1200);
        }
        if (frame === 11) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       2. LOCK
       ---------------------------------------------------------- */
    else if (mode === 'lock') {
        if (frame === 1)  { move('t1', '400px'); showTag('t1', 'Tiến đến tài nguyên...'); }
        if (frame === 2)  { move('t1', '630px', '210px'); setLock('zone', true); showTag('t1', 'lock.acquire()', 'fn'); showTag('zone', 'Đang khóa 🔒', 'err'); }

        if (frame === 4)  { move('t2', '400px'); showTag('t2', 'lock.acquire() → Blocked', 'err'); }
        if (frame === 5)  { setDim('t2', true); showTag('t2', '⏳ Đang chờ...', 'err'); }

        /* Luồng A nhả khóa -> Hiển thị hàm release() nghỉ 1 nhịp rồi mới bay đi */
        if (frame === 7)  { 
            setLock('zone', false); 
            showTag('t1', 'lock.release()', 'fn'); 
            showTag('zone', 'Mở khóa 🔓', 'ok'); 
            setTimeout(() => { move('t1', '1000px'); }, 1200);
            breathe(1200); 
        }

        if (frame === 8)  { setDim('t2', false); move('t2', '630px', '210px'); showTag('t2', 'lock.acquire()', 'fn'); setLock('zone', true); showTag('zone', 'Đang khóa 🔒', 'err'); }
        
        /* Luồng B nhả khóa -> Hiển thị hàm release() nghỉ 1 nhịp rồi bay đi */
        if (frame === 10) { 
            showTag('t2', 'lock.release()', 'fn'); 
            setLock('zone', false); 
            clearTag('zone'); 
            setTimeout(() => { move('t2', '1000px'); }, 1200);
            breathe(1200); 
        }

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
       3. RLOCK
       ---------------------------------------------------------- */
    else if (mode === 'rlock') {
        if (frame === 1) { move('t1', '350px'); showTag('t1', 'Bắt đầu chạy...'); }

        if (frame === 2) {
            move('t1', '480px'); setLock('z-out', true); updateHud('Mức khóa: 1');
            showTag('z-out', 'Đang giữ (lần 1)', 'err'); showTag('t1', 'rlock.acquire()  ← lần 1', 'fn');
        }

        if (frame === 4) {
            move('t1', '655px'); setLock('z-in', true); updateHud('Mức khóa: 2');
            showTag('z-in', 'Đang giữ (lần 2)', 'err'); showTag('t1', 'rlock.acquire()  ← lần 2 (đệ quy)', 'fn');
            breathe(700);
        }

        /* release() lần 1 -> Đứng yên 1.2s rồi mới de ra ngoài */
        if (frame === 6) {
            setLock('z-in', false); clearTag('z-in'); updateHud('Mức khóa: 1');
            showTag('t1', 'rlock.release()  ← lần 1', 'fn');
            setTimeout(() => { move('t1', '490px'); }, 1200);
            breathe(1200);
        }

        /* release() lần 2 -> Đứng yên 1.2s rồi mới bay hẳn */
        if (frame === 8) {
            setLock('z-out', false); clearTag('z-out'); updateHud('Mức khóa: 0  (Unlocked)');
            showTag('t1', 'rlock.release()  ← lần 2', 'fn');
            setTimeout(() => { move('t1', '1000px'); }, 1200);
            breathe(1200);
        }
        if (frame === 12) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       4. SEMAPHORE
       ---------------------------------------------------------- */
    else if (mode === 'semaphore') {
        if (frame === 1)  { move('t1', '450px', '90px');  showTag('t1', 'sem.acquire()  ← count--', 'fn'); }
        if (frame === 2)  { move('t1', '660px', '90px');  setLock('s1', true); updateHud('Chỗ trống: 2'); document.getElementById('hud').style.color = '#fbc531'; showTag('t1', 'Đã chiếm Slot 1 ✓', 'ok'); showTag('s1', 'count=2', 'err'); }

        if (frame === 3)  { move('t2', '450px', '210px'); showTag('t2', 'sem.acquire()  ← count--', 'fn'); }
        if (frame === 4)  { move('t2', '660px', '210px'); setLock('s2', true); updateHud('Chỗ trống: 1'); showTag('t2', 'Đã chiếm Slot 2 ✓', 'ok'); showTag('s2', 'count=1', 'err'); }

        if (frame === 5)  { move('t3', '450px', '330px'); showTag('t3', 'sem.acquire()  ← count--', 'fn'); }
        if (frame === 6)  { move('t3', '660px', '330px'); setLock('s3', true); updateHud('Chỗ trống: 0'); document.getElementById('hud').style.color = '#e84118'; showTag('t3', 'Đã chiếm Slot 3 ✓', 'ok'); showTag('s3', 'count=0', 'err'); }

        if (frame === 7)  { move('t4', '450px', '400px'); showTag('t4', 'sem.acquire()  ← count=0', 'fn'); }
        if (frame === 8)  { setDim('t4', true); showTag('t4', '⏳ Blocked! Chờ release()...', 'err'); }

        /* T1 release() -> Hiện tên hàm 1.2s rồi rời đi */
        if (frame === 10) { 
            setLock('s1', false); clearTag('s1'); updateHud('Chỗ trống: 1'); 
            document.getElementById('hud').style.color = '#fbc531'; 
            showTag('t1', 'sem.release()  ← count++', 'fn'); 
            setTimeout(() => { move('t1', '1000px', '90px'); }, 1200);
            breathe(1200); 
        }

        if (frame === 11) { setDim('t4', false); clearTag('t4'); move('t4', '660px', '90px'); setLock('s1', true); updateHud('Chỗ trống: 0'); document.getElementById('hud').style.color = '#e84118'; showTag('t4', 'Chiếm Slot 1 ✓ (sau khi T1 release)', 'ok'); showTag('s1', 'count=0', 'err'); }

        if (frame === 15) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       5. CONDITION
       ---------------------------------------------------------- */
    else if (mode === 'condition') {
        if (frame === 1)  { move('c', '400px'); showTag('c', 'cond.acquire()', 'fn'); }
        if (frame === 2)  { showTag('zone', 'Buffer trống!', 'err'); showTag('c', 'cond.wait()  ← nhả khóa & ngủ', 'err'); }
        if (frame === 3)  { setDim('c', true); clearTag('zone'); }

        if (frame === 5)  { move('p', '400px');      showTag('p', 'cond.acquire()', 'fn'); }
        if (frame === 6)  { move('p', '645px', '220px'); showTag('p', 'Ghi dữ liệu vào Buffer...', 'ok'); }
        if (frame === 7)  {
            document.getElementById('item').style.opacity = 1;
            document.getElementById('zone').style.background = 'rgba(76, 209, 55, 0.2)';
            showTag('zone', 'Có dữ liệu! 📦');
            showTag('p', 'cond.notify()  ← đánh thức Consumer', 'fn');
            breathe(800);
        }

        if (frame === 9)  { setDim('c', false); showTag('c', '⏳ Thức dậy, chờ acquire()...', 'ok'); breathe(700); }

        /* Producer release() -> Hiện tên hàm 1.2s rồi rời đi */
        if (frame === 11) { 
            showTag('p', 'cond.release()  ← nhả khóa', 'fn'); 
            setTimeout(() => { move('p', '1000px'); }, 1200);
            breathe(1200);
        }

        if (frame === 12) { move('c', '645px', '220px'); showTag('c', 'cond.acquire()  ← đã được vào', 'fn'); }
        if (frame === 13) { document.getElementById('item').style.opacity = 0; showTag('c', 'Lấy dữ liệu ✓'); }
        
        /* Consumer release() -> Hiện tên hàm 1.2s rồi rời đi */
        if (frame === 15) {
            showTag('c', 'cond.release()', 'fn');
            showTag('zone', 'Buffer trống');
            document.getElementById('zone').style.background = 'rgba(127, 143, 166, 0.1)';
            setTimeout(() => { move('c', '1000px'); }, 1200);
            breathe(1200);
        }
        if (frame === 18) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       6. EVENT
       ---------------------------------------------------------- */
    else if (mode === 'event') {
        let sigStatus = document.getElementById('signal-status');
        let buf       = document.getElementById('buffer');
        let dataItem  = document.getElementById('data-item');
        let lockStatus = document.getElementById('lock-status');

        if (frame === 1) { move('cons', '320px'); showTag('cons', 'event.wait()  ← Flag=False → Blocked', 'err'); }
        if (frame === 3) { setDim('cons', true); if (lockStatus) { lockStatus.innerText = 'Trạng thái: Blocked'; lockStatus.style.color = '#e84118'; lockStatus.style.borderColor = '#e84118'; } }
        
        if (frame === 5) { move('prod', '320px', '120px'); showTag('prod', 'Chuẩn bị ghi dữ liệu...', 'ok'); }
        if (frame === 7) { move('prod', '615px', '220px'); showTag('prod', 'Ghi dữ liệu vào Bộ Đệm 📦'); }
        if (frame === 9) { if (dataItem) dataItem.style.opacity = 1; if (buf) buf.style.background = 'rgba(76, 209, 55, 0.2)'; showTag('prod', 'Ghi xong! ✓', 'ok'); }

        if (frame === 11) {
            showTag('prod', 'event.set()  ← Flag = True', 'fn');
            if (sigStatus) { sigStatus.innerText = 'Event Flag: True ✓'; sigStatus.style.color = '#4cd137'; sigStatus.style.borderColor = '#4cd137'; }
            breathe(900);
        }
        
        if (frame === 12) {
            setDim('cons', false);
            showTag('cons', '🔔 Nhận tín hiệu! Thoát wait()', 'ok');
            if (lockStatus) { lockStatus.innerText = 'Trạng thái: Hoạt động'; lockStatus.style.color = '#4cd137'; lockStatus.style.borderColor = '#4cd137'; }
        }

        /* Producer lui ra, event.clear() -> Dừng lại 1.2s hiện hàm rồi mới lùi */
        if (frame === 14) {
            showTag('prod', 'event.clear()  ← Flag = False', 'fn');
            if (sigStatus) { sigStatus.innerText = 'Event Flag: False'; sigStatus.style.color = '#f1c40f'; sigStatus.style.borderColor = '#f1c40f'; }
            setTimeout(() => { move('prod', '320px', '120px'); }, 1200);
            breathe(1200);
        }

        if (frame === 16) { move('cons', '615px', '270px'); showTag('cons', 'Lấy dữ liệu ra xử lý...'); }
        if (frame === 18) { if (dataItem) dataItem.style.opacity = 0; if (buf) buf.style.background = 'rgba(127, 143, 166, 0.1)'; showTag('cons', 'Xử lý xong ✓', 'ok'); }

        if (frame === 20) {
            showTag('cons', 'Hoàn thành');
            showTag('prod', 'Nghỉ (Sleep)');
            if (lockStatus) { lockStatus.innerText = 'Trạng thái Lock: Mở'; lockStatus.style.color = '#3498db'; lockStatus.style.borderColor = '#3498db'; }
            setTimeout(() => {
                move('cons', '1000px', '270px');
                move('prod', '1000px', '120px');
            }, 1000);
            breathe(1000);
        }

        if (frame === 24) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       7. RACE CONDITION
       ---------------------------------------------------------- */
    else if (mode === 'race') {
        if (frame === 1)  { move('t1', '240px'); move('t2', '600px'); showTag('db', 'Số dư GỐC: 1000$'); }
        if (frame === 3)  { showTag('t1', 'Đọc số dư: 1000$  ← READ'); }
        if (frame === 4)  { showTag('t2', 'Đọc số dư: 1000$  ← READ'); }
        if (frame === 6)  { showTag('t1', 'Tính: 1000 + 500 = 1500'); }
        
        /* Hiện xong chữ, nghỉ 1 nhịp rồi mới lùi khối t1 về */
        if (frame === 8)  {
            showTag('t1', 'WRITE: 1500$ ✓', 'ok');
            showTag('db', 'Số dư: 1500$', 'ok');
            setTimeout(() => { move('t1', '240px', '100px'); }, 1000);
            breathe(1000);
        }

        if (frame === 10) { showTag('t2', 'Tính: 1000 + 500 = 1500  ← dùng GIÁ TRỊ CŨ!', 'err'); }
        
        /* Hiện chữ GHI ĐÈ, nghỉ 1 nhịp rồi mới lùi khối t2 */
        if (frame === 12) {
            showTag('t2', 'WRITE: 1500$ ← GHI ĐÈ! ❌', 'err');
            showTag('db', 'Số dư: 1500$ (MẤT 500$!)', 'err');
            let db = document.getElementById('db');
            if (db) { db.style.borderColor = '#e84118'; db.style.background = 'rgba(232,65,24,0.15)'; }
            updateHud('❌ LỖI: Race Condition - Mất 500$!');
            document.getElementById('hud').style.color = '#e84118';
            setTimeout(() => { move('t2', '600px', '260px'); }, 1000);
            breathe(1000);
        }
        if (frame === 17) { nextLoop(); }
    }

    /* ----------------------------------------------------------
       8. DEADLOCK
       ---------------------------------------------------------- */
    else if (mode === 'deadlock') {
        if (frame === 1) { move('t1', '220px'); move('t2', '620px'); }
        if (frame === 3) {
            setLock('z1', true); showTag('t1', 'lock1.acquire() ✓', 'fn'); showTag('z1', 'T1 đang giữ 🔒', 'err');
            setLock('z2', true); showTag('t2', 'lock2.acquire() ✓', 'fn'); showTag('z2', 'T2 đang giữ 🔒', 'err');
        }
        if (frame === 5) { move('t1', '450px'); showTag('t1', 'lock2.acquire() ← Muốn Tài Nguyên 2', 'fn'); }
        if (frame === 7) { move('t2', '390px'); showTag('t2', 'lock1.acquire() ← Muốn Tài Nguyên 1', 'fn'); }
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