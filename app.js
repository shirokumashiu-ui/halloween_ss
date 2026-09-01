// ==========================================
// 【★お菓子（または表示テキスト）のデータリスト★】
// ==========================================
const CANDY_LIST = [
  { type: 'text', content: 'あ' }, // 1回目
  { type: 'text', content: 'い' }, // 2回目
  { type: 'text', content: 'う' }, // 3回目
  { type: 'text', content: 'え' }, // 4回目
  { type: 'text', content: 'お' }, // 5回目
  { type: 'text', content: 'か' }, // 6回目
  { type: 'text', content: 'き' }, // 7回目
];

const TARGET_SCORE = CANDY_LIST.length;

document.addEventListener('DOMContentLoaded', () => {
  
  const scoreText = document.getElementById('score');
  const clearMessage = document.getElementById('clear-message');
  const guideOverlay = document.getElementById('guide-overlay');
  const loadingScreen = document.getElementById('loading');
  const marker = document.getElementById('obake-marker');
  const candyContainer = document.getElementById('candy-container');
  const btnRetry = document.getElementById('btn-retry');
  const collectedLettersBox = document.getElementById('collected-letters'); // 追加

  let score = 0;
  let isMarkerVisible = false; 
  let hasScoredThisScan = false;

  if (btnRetry) {
    btnRetry.addEventListener('click', resetGame);
  }

  window.addEventListener('camera-init', () => {
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.5s ease';
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  });

  if (marker) {
    marker.addEventListener('markerFound', () => {
      if (guideOverlay) guideOverlay.style.opacity = '0';
      isMarkerVisible = true;
      
      if (score < TARGET_SCORE && !hasScoredThisScan) {
        hasScoredThisScan = true; 
        spawnAndAutoCollect();
      }
    });

    marker.addEventListener('markerLost', () => {
      isMarkerVisible = false;
      hasScoredThisScan = false; 

      if (score < TARGET_SCORE && guideOverlay) {
        guideOverlay.style.opacity = '1';
      }
    });
  }

  function spawnAndAutoCollect() {
    if (!candyContainer) return;
    candyContainer.innerHTML = ''; 

    const currentCandy = CANDY_LIST[score];
    let element;

    if (currentCandy.type === 'image') {
      element = document.createElement('img');
      element.src = currentCandy.content;
      element.className = 'candy-item';
    } else {
      element = document.createElement('div');
      element.innerText = currentCandy.content;
      element.className = 'candy-item text-candy';
    }

    candyContainer.appendChild(element);

    setTimeout(() => {
      collectCandyAutomatically(element, currentCandy);
    }, 1200); 
  }

  function collectCandyAutomatically(element, currentCandy) {
    element.style.transition = 'all 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
    element.style.transform = 'scale(0) translateY(100px)'; 
    element.style.opacity = '0';

    setTimeout(() => {
      // 1. 下部の「あつめた文字一覧」にバッジを追加
      if (collectedLettersBox) {
        const badge = document.createElement('span');
        badge.className = 'letter-badge';
        badge.innerText = currentCandy.content;
        collectedLettersBox.appendChild(badge);
      }

      // 2. カウント数を1増やす
      score++;
      if (scoreText) scoreText.innerText = score;

      // 3. クリア判定
      if (score >= TARGET_SCORE) {
        if (clearMessage) clearMessage.style.display = 'block';
      }
    }, 500);
  }

  function resetGame() {
    score = 0;
    hasScoredThisScan = false;
    isMarkerVisible = false;
    if (scoreText) scoreText.innerText = score;
    if (clearMessage) clearMessage.style.display = 'none';
    if (guideOverlay) guideOverlay.style.opacity = '1';
    if (candyContainer) candyContainer.innerHTML = ''; 
    if (collectedLettersBox) collectedLettersBox.innerHTML = ''; // あつめた文字一覧をクリア
  }
});
