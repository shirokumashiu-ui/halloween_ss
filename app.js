// ==========================================
// 【★デザイン差し替え用：お菓子イラストのパス★】
// ==========================================
const CANDY_IMAGE = './assets/candy_01.png';

// 画面の全てのHTML要素（DOM）の準備が整ってからゲームのロジックを開始する（エラー防止）
document.addEventListener('DOMContentLoaded', () => {
  
  const scoreText = document.getElementById('score');
  const clearMessage = document.getElementById('clear-message');
  const guideOverlay = document.getElementById('guide-overlay');
  const loadingScreen = document.getElementById('loading');
  const marker = document.getElementById('obake-marker');
  const candyContainer = document.getElementById('candy-container');
  const btnRetry = document.getElementById('btn-retry');

  let score = 0;
  let candiesSpawned = false; 

  // リトライボタンにクリックイベントを設定
  if (btnRetry) {
    btnRetry.addEventListener('click', resetGame);
  }

  // ARエンジンの起動準備ができたらローディング画面を非表示にする
  window.addEventListener('camera-init', () => {
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.5s ease';
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  });

  // 👻 Hiroマーカーを検出した瞬間の処理
  if (marker) {
    marker.addEventListener('markerFound', () => {
      if (guideOverlay) guideOverlay.style.opacity = '0';
      
      if (!candiesSpawned) {
        candiesSpawned = true;
        spawnAndAutoCollect();
      }
    });

    marker.addEventListener('markerLost', () => {
      if (!candiesSpawned && guideOverlay) {
        guideOverlay.style.opacity = '1';
      }
    });
  }

  // お菓子が自動で出て、自動で吸い込まれて消える演出
  function spawnAndAutoCollect() {
    if (!candyContainer) return;
    candyContainer.innerHTML = ''; 

    const candyImg = document.createElement('img');
    candyImg.src = CANDY_IMAGE;
    candyImg.className = 'candy-item';
    candyContainer.appendChild(candyImg);

    setTimeout(() => {
      collectCandyAutomatically(candyImg);
    }, 1200); 
  }

  // 自動でお菓子を消してお祝い画面を出す処理
  function collectCandyAutomatically(candyElement) {
    candyElement.style.transition = 'all 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
    candyElement.style.transform = 'scale(0) translateY(100px)'; 
    candyElement.style.opacity = '0';

    setTimeout(() => {
      score = 1;
      if (scoreText) scoreText.innerText = score;
      if (clearMessage) clearMessage.style.display = 'block';
    }, 500);
  }

  // ゲームリセット処理
  function resetGame() {
    score = 0;
    if (scoreText) scoreText.innerText = score;
    if (clearMessage) clearMessage.style.display = 'none';
    if (guideOverlay) guideOverlay.style.opacity = '1';
    if (candyContainer) candyContainer.innerHTML = ''; 
    candiesSpawned = false; 
  }
});
