const scoreText = document.getElementById('score');
const clearMessage = document.getElementById('clear-message');
const guideOverlay = document.getElementById('guide-overlay');
const loadingScreen = document.getElementById('loading');
const marker = document.getElementById('obake-marker');

let score = 0;
const maxScore = 3;

// ARエンジンのカメラ準備が整ったらローディングをフェードアウトして消す
window.addEventListener('camera-init', () => {
  if (loadingScreen) {
    loadingScreen.style.transition = 'opacity 0.5s ease';
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
});

// マーカーがカメラの枠に入った瞬間の処理
marker.addEventListener('markerFound', () => {
  guideOverlay.style.opacity = '0';
});

// マーカーがカメラから外れた瞬間の処理
marker.addEventListener('markerLost', () => {
  guideOverlay.style.opacity = '1';
});

// スマートフォンでARお菓子をタップした時の処理
function collectCandy(candyId) {
  const candyElement = document.getElementById(candyId);
  if (candyElement && candyElement.getAttribute('visible') !== false) {
    // タップされたお菓子を非表示にする
    candyElement.setAttribute('visible', 'false');
    score++;
    scoreText.innerText = score;

    // すべて集めたらお祝いポップアップを表示
    if (score === maxScore) {
      clearMessage.style.display = 'block';
    }
  }
}

// ゲームリセット（もう一回あそぶボタン用）
function resetGame() {
  score = 0;
  scoreText.innerText = score;
  clearMessage.style.display = 'none';
  guideOverlay.style.opacity = '1';

  // すべてのお菓子をもう一度出現させる
  for (let i = 1; i <= maxScore; i++) {
    const candy = document.getElementById(`candy${i}`);
    if (candy) {
      candy.setAttribute('visible', 'true');
    }
  }
}
