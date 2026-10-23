/**
 * BEYZA 🤍
 * 1. Ekran: Siyah ekran, "Kalp çiz", çizilenler silinmez, 5 saniye sonra otomatik açılır.
 * 2. Ekran: Siyah ekran, boşluğa tıklandığı yerde beyaz kalp oluşur; ne kadar uzun basılırsa o kadar büyür.
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. EKRAN: SİYAH EKRAN & KALP ÇİZİMİ (Çizilenler ASLA silinmez)
  // =========================================================================
  const drawScreen = document.getElementById('draw-screen');
  const drawCanvas = document.getElementById('draw-canvas');
  const drawCtx = drawCanvas.getContext('2d');
  const timerBar = document.getElementById('timer-bar');

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let timerStarted = false;
  let timerStartTime = 0;
  const DURATION = 5000; // 5 saniye

  function resizeDrawCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Var olan çizimi korumak için geçici kopyalama
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = drawCanvas.width;
    tempCanvas.height = drawCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (drawCanvas.width > 0 && drawCanvas.height > 0) {
      tempCtx.drawImage(drawCanvas, 0, 0);
    }

    drawCanvas.width = w * dpr;
    drawCanvas.height = h * dpr;
    drawCanvas.style.width = `${w}px`;
    drawCanvas.style.height = `${h}px`;
    drawCtx.scale(dpr, dpr);

    drawCtx.fillStyle = '#000000';
    drawCtx.fillRect(0, 0, w, h);

    if (tempCanvas.width > 0 && tempCanvas.height > 0) {
      drawCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width / dpr, tempCanvas.height / dpr);
    }

    drawCtx.strokeStyle = '#ffffff';
    drawCtx.lineWidth = 4;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.shadowColor = 'rgba(255, 255, 255, 0.9)';
    drawCtx.shadowBlur = 10;
  }

  resizeDrawCanvas();
  window.addEventListener('resize', () => {
    if (drawScreen.classList.contains('active')) {
      resizeDrawCanvas();
    }
  });

  // 5 Saniyelik Zamanlayıcı
  function startFiveSecondTimer() {
    if (timerStarted) return;
    timerStarted = true;
    timerStartTime = performance.now();

    function updateTimer(now) {
      const elapsed = now - timerStartTime;
      const progress = Math.min((elapsed / DURATION) * 100, 100);
      if (timerBar) {
        timerBar.style.width = `${progress}%`;
      }

      if (elapsed >= DURATION) {
        openHeartScreen();
      } else {
        requestAnimationFrame(updateTimer);
      }
    }

    requestAnimationFrame(updateTimer);
  }

  // Pointer Events ile Çizim (Hem Mouse hem Dokunmatik)
  function onPointerDownDraw(e) {
    if (!drawScreen.classList.contains('active')) return;
    isDrawing = true;
    lastX = e.clientX;
    lastY = e.clientY;

    startFiveSecondTimer();

    // Tıklanan yere anında nokta çiz
    drawCtx.beginPath();
    drawCtx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
    drawCtx.fillStyle = '#ffffff';
    drawCtx.fill();
  }

  function onPointerMoveDraw(e) {
    if (!isDrawing || !drawScreen.classList.contains('active')) return;

    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(e.clientX, e.clientY);
    drawCtx.stroke();

    lastX = e.clientX;
    lastY = e.clientY;
  }

  function onPointerUpDraw() {
    isDrawing = false;
  }

  window.addEventListener('pointerdown', onPointerDownDraw);
  window.addEventListener('pointermove', onPointerMoveDraw);
  window.addEventListener('pointerup', onPointerUpDraw);
  window.addEventListener('pointercancel', onPointerUpDraw);

  // Sayfa açıldığında hiç dokunulmasa bile 5 saniye sonra otomatik açılma
  setTimeout(() => {
    if (!timerStarted) {
      startFiveSecondTimer();
    }
  }, 1000);

  // =========================================================================
  // 2. EKRAN: AÇILAN SİYAH EKRAN & BÜYÜYEN BEYAZ KALP
  // =========================================================================
  const heartScreen = document.getElementById('heart-screen');
  const heartCanvas = document.getElementById('heart-canvas');
  const heartCtx = heartCanvas.getContext('2d');

  // Kalıcı kalpler ve ışıltı parçacıkları listesi
  let hearts = [];
  let sparkles = [];
  let activeHeart = null;
  let animationRunning = false;
  let lastTime = 0;

  function resizeHeartCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    heartCanvas.width = w * dpr;
    heartCanvas.height = h * dpr;
    heartCanvas.style.width = `${w}px`;
    heartCanvas.style.height = `${h}px`;
    heartCtx.scale(dpr, dpr);
  }

  function openHeartScreen() {
    isDrawing = false;
    window.removeEventListener('pointerdown', onPointerDownDraw);
    window.removeEventListener('pointermove', onPointerMoveDraw);
    window.removeEventListener('pointerup', onPointerUpDraw);
    window.removeEventListener('pointercancel', onPointerUpDraw);

    drawScreen.classList.remove('active');

    setTimeout(() => {
      drawScreen.style.display = 'none';
      heartScreen.classList.add('active');
      resizeHeartCanvas();

      lastTime = performance.now();
      if (!animationRunning) {
        animationRunning = true;
        requestAnimationFrame(renderHearts);
      }
    }, 600);
  }

  window.addEventListener('resize', () => {
    if (heartScreen.classList.contains('active')) {
      resizeHeartCanvas();
    }
  });

  // Estetik, Pürüzsüz & Parlak Beyaz Kalp Çizimi
  function drawAestheticHeart(ctx, cx, cy, size, rotation = 0, opacity = 1) {
    if (opacity <= 0) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = Math.min(1, Math.max(0, opacity));

    // Zarif & Yumuşak Beyaz Işıma Aurası
    ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowBlur = Math.min(size * 0.4, 30);

    ctx.beginPath();
    const steps = 70;
    for (let i = 0; i <= steps; i++) {
      const t = (Math.PI * 2 * i) / steps;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const px = (hx / 16) * size;
      const py = (hy / 16) * size;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  // Kalp arkasında minik parıltı izi (Stardust particles)
  function emitStardust(x, y, count = 1) {
    for (let i = 0; i < count; i++) {
      sparkles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + Math.random() * 15,
        vx: (Math.random() - 0.5) * 15,
        vy: Math.random() * 20 + 10,
        size: Math.random() * 2.2 + 1,
        alpha: 0.8,
        life: 1
      });
    }
  }

  // Kalp ve Parıltı Render Döngüsü
  function renderHearts(now) {
    if (!lastTime) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Siyah arka planı temizle
    heartCtx.fillStyle = '#000000';
    heartCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // 1. Minik Parıltı Yıldızlarını Çiz ve Güncelle
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.alpha -= 0.6 * dt;

      if (sp.alpha <= 0) {
        sparkles.splice(i, 1);
        continue;
      }

      heartCtx.save();
      heartCtx.globalAlpha = sp.alpha;
      heartCtx.fillStyle = '#ffffff';
      heartCtx.shadowColor = '#ffffff';
      heartCtx.shadowBlur = 6;
      heartCtx.beginPath();
      heartCtx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      heartCtx.fill();
      heartCtx.restore();
    }

    // 2. Kalpleri Estetik, Yavaş ve Salınarak Yukarı Hareket Ettir
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];

      // Yavaş ve zarif dikey hız (Hız: 80 - 130 px/saniye)
      h.y -= h.speedY * dt;

      // Doğal ve estetik yatay salınım (Sway)
      h.swayPhase += dt * h.swaySpeed;
      const currentX = h.baseX + Math.sin(h.swayPhase) * h.swayAmp;

      // Hafif açısal salınım (Hafifçe sağa-sola eğilerek süzülür)
      const currentRotation = Math.sin(h.swayPhase) * 0.07;

      // Ekranın yukarısına yaklaştıkça zarifçe saydamlaşsın (Fade out)
      let opacity = 1;
      if (h.y < 160) {
        opacity = Math.max(0, h.y / 160);
      }

      // Hafif parıltı tozu bırak
      if (Math.random() > 0.65) {
        emitStardust(currentX, h.y + h.size * 0.4, 1);
      }

      // Kalbi çiz
      drawAestheticHeart(heartCtx, currentX, h.y, h.size, currentRotation, opacity);

      // Ekranın üstünden tamamen kaybolunca bellekten temizle
      if (h.y + h.size < -50 || opacity <= 0.02) {
        hearts.splice(i, 1);
      }
    }

    // 3. Basılı Tutulmakta Olan Büyüyen Kalp
    if (activeHeart) {
      // Büyüme hızı: Dokunulduğunda pürüzsüz ve tatlı bir şekilde büyür
      activeHeart.size += (80 + activeHeart.size * 0.22) * dt;

      // Hafif canlı nabız atışı (Breathing pulse)
      const pulseScale = 1 + Math.sin(now * 0.008) * 0.035;

      // Büyürken etrafa minik ışıltılar saçsın
      if (Math.random() > 0.5) {
        emitStardust(activeHeart.x, activeHeart.y, 1);
      }

      drawAestheticHeart(heartCtx, activeHeart.x, activeHeart.y, activeHeart.size * pulseScale, 0, 1);
    }

    requestAnimationFrame(renderHearts);
  }

  // İkinci Ekran Etkileşimi: Tıkla ve Basılı Tut (Pointer Events)
  function onPointerDownHeart(e) {
    if (!heartScreen.classList.contains('active')) return;

    const hint = document.querySelector('.heart-hint');
    if (hint) {
      hint.style.transition = 'opacity 0.6s ease';
      hint.style.opacity = '0';
    }

    activeHeart = {
      x: e.clientX,
      y: e.clientY,
      size: 24 // Başlangıç boyutu
    };
  }

  function onPointerUpHeart() {
    if (activeHeart) {
      // Yavaş, rüya gibi süzülen sakin hız (Çok daha estetik ve huzurlu)
      const gentleSpeedY = Math.random() * 25 + 50; // 50px - 75px / saniye (ağır ve zarif)
      const swayAmplitude = Math.random() * 16 + 12; // 12px - 28px arası tatlı salınım
      const swaySpeed = Math.random() * 0.6 + 0.9;

      hearts.push({
        baseX: activeHeart.x,
        y: activeHeart.y,
        size: activeHeart.size,
        speedY: gentleSpeedY,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: swayAmplitude,
        swaySpeed: swaySpeed
      });

      // Bırakıldığı an küçük bir ışıltı halkası saçsın
      emitStardust(activeHeart.x, activeHeart.y, 4);

      activeHeart = null;
    }
  }

  window.addEventListener('pointerdown', onPointerDownHeart);
  window.addEventListener('pointerup', onPointerUpHeart);
  window.addEventListener('pointercancel', onPointerUpHeart);

});
