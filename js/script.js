let mode = 'lock';
let autoTimer;
let frame = 0;
let isPaused = false;
const screen = document.getElementById('sim-screen');

function createBlock(id, cls, text, style) {
    return `<div class="obj ${cls}" id="${id}" style="${style}">${text}<div class="tag" id="tag-${id}"></div></div>`;
}

function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('btn-pause');
    const badge = document.getElementById('status-badge');
    
    if (isPaused) {
        clearInterval(autoTimer);
        btn.innerHTML = "Tiếp tục";
        btn.classList.add('paused');
        badge.innerHTML = "Đã tạm dừng";
        badge.style.background = "#e84118";
        badge.style.animation = "none";
    } else {
        autoTimer = setInterval(runVideoFrame, 1500);
        btn.innerHTML = "Tạm dừng";
        btn.classList.remove('paused');
        badge.innerHTML = "Đang chạy...";
        badge.style.background = "#4cd137";
        badge.style.animation = "pulse 2s infinite";
    }
}

function initSim() {
    clearInterval(autoTimer);
    mode = document.getElementById('sim-select').value;
    frame = 0;
    
    isPaused = false;
    const btn = document.getElementById('btn-pause');
    const badge = document.getElementById('status-badge');
    if(btn && badge) {
        btn.innerHTML = "Tạm dừng";
        btn.classList.remove('paused');
        badge.innerHTML = "Đang chạy...";
        badge.style.background = "#4cd137";
        badge.style.animation = "pulse 2s infinite";
    }
    
    let html = `<div class="title-box" id="title"></div><div class="hud-box" id="hud"></div>`;

    if (mode === 'thread') {
        html += `<div class="lane" style="top: 150px;"></div><div class="lane" style="top: 250px;"></div><div class="lane" style="top: 350px;"></div>`;
        html += createBlock('t1', 'thread t-a', 'Main', 'top: 120px; left: -150px;');
        html += createBlock('t2', 'thread t-b', 'T1', 'top: 220px; left: -150px;');
        html += createBlock('t3', 'thread t-c', 'T2', 'top: 320px; left: -150px;');
    } 
    else if (mode === 'lock') {
        html += createBlock('zone', 'zone', 'Tài Nguyên', 'width: 220px; height: 160px; top: 170px; left: 550px;');
        html += createBlock('t1', 'thread t-a', 'A', 'top: 180px; left: -150px;');
        html += createBlock('t2', 'thread t-b', 'B', 'top: 260px; left: -150px;');
        // Bổ sung luồng thứ 3 (C) cho kịch bản gây lỗi
        html += createBlock('t3', 'thread t-c', 'C', 'top: 340px; left: -150px;');
    } 
    else if (mode === 'rlock') {
        html += createBlock('z-out', 'zone', 'Hàm Ngoài', 'width: 340px; height: 260px; top: 120px; left: 450px;');
        html += createBlock('z-in', 'zone', 'Hàm Trong', 'width: 140px; height: 100px; top: 200px; left: 620px;');
        html += createBlock('t1', 'thread t-b', 'A', 'top: 220px; left: -150px;');
    } 
    else if (mode === 'semaphore') {
        html += createBlock('s1', 'zone', 'Slot 1', 'width: 120px; height: 80px; top: 80px; left: 650px;');
        html += createBlock('s2', 'zone', 'Slot 2', 'width: 120px; height: 80px; top: 200px; left: 650px;');
        html += createBlock('s3', 'zone', 'Slot 3', 'width: 120px; height: 80px; top: 320px; left: 650px;');
        html += createBlock('t1', 'thread t-a', 'T1', 'top: 90px; left: -150px;'); 
        html += createBlock('t2', 'thread t-b', 'T2', 'top: 210px; left: -150px;');
        html += createBlock('t3', 'thread t-c', 'T3', 'top: 330px; left: -150px;');
        html += createBlock('t4', 'thread t-d', 'T4', 'top: 400px; left: -150px;');
    } 
    else if (mode === 'condition') {
        html += createBlock('zone', 'zone', 'Bộ Đệm (Buffer)', 'width: 250px; height: 180px; top: 160px; left: 550px;');
        html += `<div class="obj icon" id="item" style="top: 225px; left: 650px; opacity: 0; font-size: 50px;">📦</div>`;
        html += createBlock('c', 'thread t-b', 'Khách', 'top: 175px; left: -150px;');
        html += createBlock('p', 'thread t-a', 'Thợ', 'top: 265px; left: -150px;');
    } 
    else if (mode === 'event') {
        html += `<div class="gate" id="gate"><div class="gate-tag" id="gate-tag"></div></div>`;
        html += createBlock('t1', 'thread t-a', 'A', 'top: 100px; left: -150px;');
        html += createBlock('t2', 'thread t-b', 'B', 'top: 220px; left: -150px;');
        html += createBlock('t3', 'thread t-c', 'C', 'top: 340px; left: -150px;');
    } 
    else if (mode === 'race') {
        html += createBlock('db', 'zone', 'Tài Khoản Chung', 'width: 240px; height: 120px; top: 150px; left: 330px;');
        html += createBlock('t1', 'thread t-a', 'Luồng 1', 'top: 180px; left: -150px;');
        html += createBlock('t2', 'thread t-b', 'Luồng 2', 'top: 180px; left: 1050px;');
    } 
    else if (mode === 'deadlock') {
        html += createBlock('z1', 'zone', 'Tài Nguyên 1', 'width: 200px; height: 140px; top: 150px; left: 150px;');
        html += createBlock('z2', 'zone', 'Tài Nguyên 2', 'width: 200px; height: 140px; top: 150px; left: 550px;');
        html += createBlock('t1', 'thread t-a', 'T1', 'top: 190px; left: -150px;');
        html += createBlock('t2', 'thread t-b', 'T2', 'top: 190px; left: 1050px;');
    }

    screen.innerHTML = html;
    
    const t = document.getElementById('title');
    const h = document.getElementById('hud');
    if(mode === 'thread') t.innerText = "1. Threading Module";
    if(mode === 'lock') t.innerText = "2. Lock";
    if(mode === 'rlock') { t.innerText = "3. RLock (Reentrant Lock)"; h.style.display='block'; h.innerText="Mức khóa: 0"; }
    if(mode === 'semaphore') { t.innerText = "4. Semaphore"; h.style.display='block'; h.innerText="Chỗ trống: 3"; }
    if(mode === 'condition') t.innerText = "5. Condition Variable (Nâng Cấp)";
    if(mode === 'event') t.innerText = "6. Event Flag";
    
    if(mode === 'race') { 
        t.innerText = "7. Race Condition (Ví dụ nạp tiền)"; 
        h.style.display='block'; 
        h.innerText="Mục tiêu: Nạp 2 lần 500$ = 2000$"; 
        h.style.color="#fbc531"; 
    }
    if(mode === 'deadlock') { 
        t.innerText = "8. Deadlock (Bế tắc vòng tròn)"; 
        h.style.display='block'; 
        h.innerText="Trạng thái: Hoạt động"; 
        h.style.color="#4cd137";
    }

    setTimeout(() => {
        if(!isPaused) {
            runVideoFrame(); 
            autoTimer = setInterval(runVideoFrame, 1500); 
        }
    }, 50);
}

function move(id, left, top) { 
    let el = document.getElementById(id);
    if(left) el.style.left = left; 
    if(top) el.style.top = top; 
}

function setTag(id, text, type='normal') {
    let tag = document.getElementById(`tag-${id}`);
    if(!tag) return;
    tag.innerHTML = text;
    tag.className = 'tag show';
    if(type === 'err') tag.style.color = '#e84118';
    if(type === 'ok') tag.style.color = '#4cd137';
}

function clearTag(id) {
    let tag = document.getElementById(`tag-${id}`);
    if(tag) tag.className = 'tag';
}

function setDim(id, isDim) {
    let el = document.getElementById(id);
    if(el) isDim ? el.classList.add('dim') : el.classList.remove('dim');
}

function setLock(id, isLocked) {
    let el = document.getElementById(id);
    if(el) isLocked ? el.classList.add('locked') : el.classList.remove('locked');
}

function updateHud(text) { 
    let hud = document.getElementById('hud');
    if(hud) hud.innerText = text; 
}

function runVideoFrame() {
    frame++;

    if (mode === 'thread') {
        if(frame === 1) { setTag('t1', 'import threading'); move('t1', '120px'); }
        if(frame === 3) { setTag('t1', 'Thread(target=t1).start()'); move('t1', '280px'); move('t2', '280px'); move('t3', '280px'); }
        if(frame === 5) { 
            setTag('t1', 't1.join() & t2.join()'); 
            move('t1', '1000px'); move('t2', '1000px'); move('t3', '1000px'); 
            document.getElementById('t1').style.transitionDuration = "2s";
            document.getElementById('t2').style.transitionDuration = "1s"; 
            document.getElementById('t3').style.transitionDuration = "3s"; 
        }
        if(frame === 7) { initSim(); } 
    }
    
    else if (mode === 'lock') {
        if(frame === 1) { move('t1', '400px'); setTag('t1', 'Yêu cầu vào'); }
        if(frame === 3) { move('t1', '630px', '210px'); setLock('zone', true); setTag('t1', 'lock.acquire()', 'ok'); setTag('zone', 'Khóa', 'err'); }
        
        if(frame === 4) { move('t2', '400px'); setTag('t2', 'Đến sau'); }
        if(frame === 6) { setDim('t2', true); setTag('t2', 'lock.acquire() -> Blocked', 'err'); }
        
        if(frame === 8) { move('t1', '1000px'); setLock('zone', false); setTag('t1', 'lock.release()', 'ok'); setTag('zone', 'Mở', 'ok'); }
        if(frame === 9) { setDim('t2', false); move('t2', '630px', '210px'); setTag('t2', 'Vào được', 'ok'); setLock('zone', true); setTag('zone', 'Khóa', 'err'); }
        if(frame === 11) { move('t2', '1000px'); setTag('t2', 'lock.release()'); setLock('zone', false); clearTag('zone'); }
        
        // --- LUỒNG THỨ 3 (C) XUẤT HIỆN VÀ GÂY LỖI ---
        if(frame === 13) { move('t3', '400px'); setTag('t3', 'Chưa acquire()'); }
        if(frame === 15) { setTag('t3', 'lock.release()', 'err'); }
        if(frame === 16) { 
            setTag('t3', 'Exception: RuntimeError!', 'err'); 
            setDim('t3', true);
            let t3El = document.getElementById('t3');
            if(t3El) {
                t3El.style.boxShadow = "0 0 20px #e84118";
                t3El.style.borderColor = "#e84118";
            }
            
            updateHud("Lỗi: RuntimeError exception!");
            let hud = document.getElementById('hud');
            if(hud) {
                hud.style.display = 'block';
                hud.style.color = "#e84118";
            }
        }
        
        if(frame === 20) { initSim(); }
    }
    
    else if (mode === 'rlock') {
        if(frame === 1) { move('t1', '350px'); setTag('t1', 'Chạy'); }
        if(frame === 3) { move('t1', '480px'); setLock('z-out', true); updateHud("Mức khóa: 1"); setTag('z-out', 'Khóa lần 1'); setTag('t1', 'rlock.acquire()', 'ok'); }
        if(frame === 5) { move('t1', '650px'); setLock('z-in', true); updateHud("Mức khóa: 2"); setTag('z-in', 'Khóa lần 2'); setTag('t1', 'rlock.acquire()', 'ok'); }
        if(frame === 7) { move('t1', '480px'); setLock('z-in', false); clearTag('z-in'); updateHud("Mức khóa: 1"); setTag('t1', 'rlock.release()'); }
        if(frame === 9) { move('t1', '1000px'); setLock('z-out', false); clearTag('z-out'); updateHud("Mức khóa: 0"); setTag('t1', 'rlock.release()'); }
        if(frame === 11) { initSim(); }
    }
    
    else if (mode === 'semaphore') {
        if(frame === 1) { move('t1', '450px', '90px'); setTag('t1', 'sem.acquire()'); }
        if(frame === 2) { move('t1', '660px'); setLock('s1', true); updateHud("Chỗ trống: 2"); document.getElementById('hud').style.color = "#fbc531"; setTag('t1', 'Đã chiếm Slot 1', 'ok'); setTag('s1', 'Đã giữ', 'err'); }
        if(frame === 3) { move('t2', '450px'); setTag('t2', 'sem.acquire()'); }
        if(frame === 4) { move('t2', '660px'); setLock('s2', true); updateHud("Chỗ trống: 1"); setTag('t2', 'Đã chiếm Slot 2', 'ok'); setTag('s2', 'Đã giữ', 'err'); }
        if(frame === 5) { move('t3', '450px'); setTag('t3', 'sem.acquire()'); }
        if(frame === 6) { move('t3', '660px'); setLock('s3', true); updateHud("Chỗ trống: 0"); document.getElementById('hud').style.color = "#e84118"; setTag('t3', 'Đã chiếm Slot 3', 'ok'); setTag('s3', 'Đã giữ', 'err'); }
        if(frame === 7) { move('t4', '450px'); setTag('t4', 'sem.acquire()'); }
        if(frame === 8) { setDim('t4', true); setTag('t4', 'Blocked (Count=0)', 'err'); }
        if(frame === 10) { move('t1', '1000px'); setLock('s1', false); clearTag('s1'); updateHud("Chỗ trống: 1"); document.getElementById('hud').style.color = "#fbc531"; setTag('t1', 'sem.release()', 'ok'); }
        if(frame === 11) { setDim('t4', false); clearTag('t4'); move('t4', '660px', '90px'); setLock('s1', true); updateHud("Chỗ trống: 0"); document.getElementById('hud').style.color = "#e84118"; setTag('t4', 'Đã chiếm Slot 1', 'ok'); }
        if(frame === 13) { initSim(); }
    }
    
    else if (mode === 'condition') {
        if(frame === 1) { move('c', '400px'); setTag('c', 'cond.acquire()'); }
        if(frame === 2) { setTag('zone', 'Trống rỗng', 'err'); }
        if(frame === 4) { setDim('c', true); setTag('c', 'cond.wait() (Nhả CPU & Khóa)', 'err'); clearTag('zone'); }
        if(frame === 6) { move('p', '645px', '220px'); setTag('p', 'cond.acquire()'); }
        if(frame === 7) { document.getElementById('item').style.opacity = 1; document.getElementById('zone').style.background = "rgba(76, 209, 55, 0.2)"; setTag('p', 'Sản xuất dữ liệu', 'ok'); setTag('zone', 'Có dữ liệu!'); }
        if(frame === 9) { setTag('p', 'cond.notify()'); setDim('c', false); setTag('c', 'Tỉnh dậy (Nhưng CHƯA được vào)', 'ok'); }
        if(frame === 11) { move('p', '1000px'); setTag('p', 'cond.release()'); }
        if(frame === 13) { move('c', '645px', '220px'); setTag('c', 'Lấy đồ'); clearTag('p'); document.getElementById('item').style.opacity = 0; }
        if(frame === 15) { move('c', '1000px'); setTag('c', 'cond.release()'); setTag('zone', 'Trống rỗng'); document.getElementById('zone').style.background = "rgba(127, 143, 166, 0.1)"; }
        if(frame === 17) { initSim(); }
    }
    
    else if (mode === 'event') {
        if(frame === 1) { move('t1', '500px'); move('t2', '500px'); move('t3', '500px'); }
        if(frame === 2) { 
            setDim('t1', true); setDim('t2', true); setDim('t3', true); 
            setTag('t1', 'event.wait()'); setTag('t2', 'event.wait()'); setTag('t3', 'event.wait()'); 
            document.getElementById('gate-tag').style.opacity = 1;
            document.getElementById('gate-tag').innerText = "False";
        }
        if(frame === 4) { 
            document.getElementById('gate').className = 'gate open'; 
            document.getElementById('gate-tag').innerText = "event.set()";
            document.getElementById('gate-tag').style.color = "#4cd137";
        }
        if(frame === 5) { 
            setDim('t1', false); setDim('t2', false); setDim('t3', false); 
            clearTag('t1'); clearTag('t2'); clearTag('t3'); 
        }
        if(frame === 6) { move('t1', '1000px'); move('t2', '1000px'); move('t3', '1000px'); }
        if(frame === 8) { 
            document.getElementById('gate').className = 'gate'; 
            document.getElementById('gate-tag').innerText = "event.clear()";
            document.getElementById('gate-tag').style.color = "#f1c40f";
        }
        if(frame === 10) { initSim(); }
    }
    
    else if (mode === 'race') {
        if(frame === 1) { move('t1', '240px'); move('t2', '600px'); setTag('db', 'DƯ GỐC: 1000$'); }
        if(frame === 3) { setTag('t1', 'Đọc số dư: 1000$'); }
        if(frame === 4) { setTag('t2', 'Đọc số dư: 1000$'); }
        if(frame === 6) { setTag('t1', 'Cộng 500$ (1000+500)'); }
        if(frame === 8) { 
            setTag('t1', 'LƯU: 1500$', 'ok'); 
            setTag('db', 'DƯ: 1500$', 'ok'); 
            move('t1', '240px', '100px'); 
        }
        if(frame === 10) { setTag('t2', 'Cộng 500$ (1000+500)'); }
        if(frame === 12) { 
            setTag('t2', 'LƯU GHI ĐÈ: 1500$', 'err'); 
            setTag('db', 'DƯ: 1500$ (BỊ GHI ĐÈ)', 'err'); 
            document.getElementById('db').style.borderColor = "#e84118";
            document.getElementById('db').style.background = "rgba(232, 65, 24, 0.15)";
            
            updateHud("LỖI: Mất 500$ do ghi đè"); 
            document.getElementById('hud').style.color = "#e84118";
            move('t2', '600px', '260px'); 
        }
        if(frame === 16) { initSim(); }
    }
    
    else if (mode === 'deadlock') {
        if(frame === 1) { move('t1', '220px'); move('t2', '620px'); }
        if(frame === 3) { 
            setLock('z1', true); setTag('t1', 'Đã chiếm Khóa 1', 'ok'); setTag('z1', 'Bị T1 giữ', 'err');
            setLock('z2', true); setTag('t2', 'Đã chiếm Khóa 2', 'ok'); setTag('z2', 'Bị T2 giữ', 'err');
        }
        if(frame === 6) { move('t1', '450px'); setTag('t1', 'Đòi Khóa 2 ...'); }
        if(frame === 8) { move('t2', '380px'); setTag('t2', 'Đòi Khóa 1 ...'); }
        if(frame === 10) { 
            setDim('t1', true); setTag('t1', 'Chờ T2 nhả...', 'err'); 
            setDim('t2', true); setTag('t2', 'Chờ T1 nhả...', 'err'); 
        }
        if(frame === 12) { 
            updateHud("DEADLOCK! Treo Vĩnh Viễn");
            document.getElementById('hud').style.color = "#e84118";
            setTag('z1', 'DEADLOCK', 'err'); 
            setTag('z2', 'DEADLOCK', 'err'); 
        }
        if(frame === 16) { initSim(); }
    }
}

// Chạy lần đầu
initSim();