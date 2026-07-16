// ==========================================
// 【★デザイン差し替え用：お菓子イラストのパス★】
// ==========================================
const CANDY_IMAGES = [
  './assets/candy_01.png',
  './assets/candy_02.png',
  './assets/candy_03.png'
];

const scoreText = document.getElementById('score');
const clearMessage = document.getElementById('clear-message');
const guideOverlay = document.getElementById('guide-overlay');
const loadingScreen = document.getElementById('loading');
const marker = document.getElementById('obake-marker');
const candyContainer = document.getElementById('candy-container');

let score = 0;
const maxScore = 3;
let candiesSpawned = false; // お菓子が既に出現したかどうかのフラグ

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

// 👻 オバケのマーカーをカメラが読み取った瞬間の処理！
marker.addEventListener('markerFound', () => {
  guideOverlay.style.opacity = '0'; // ガイドを隠す
  
  // まだ画面にお菓子が出ていない場合のみ、お菓子を生成する
  if (!candiesSpawned) {
    spawnCandies();
  }
});

// マーカーを見失った時
marker.addEventListener('markerLost', () => {
  // すでにお菓子が出ている場合はそのまま（見失ってもお菓子は画面に残り、タップできます）
  if (!candiesSpawned) {
    guideOverlay.style.opacity = '1';
  }
});

// 画面にお菓子をポンッ！と出現させる魔法の関数
function spawnCandies() {
  candiesSpawned = true;
  candyContainer.innerHTML = ''; // コンテナをリセット

  CANDY_IMAGES.forEach((imgSrc, index) => {
    // 画像タグを作成
    const candyImg = document.createElement('img');
    candyImg.src = imgSrc;
    candyImg.className = 'candy-item';
    candyImg.id = `candy-${index}`;
    
    // 出現タイミングを少しだけズラしてテンポを良くする（ディレイ効果）
    candyImg.style.animationDelay = `${index * 0.15}s`;

    // タップされた時のイベントを登録
    candyImg.onclick = () => {
      collectCandy(candyImg);
    };

    candyContainer.appendChild(candyImg);
  });
}

// お菓子をタップして「あつめる」処理
function collectCandy(candyElement) {
  // お菓子がすでにかき消されている場合はスキップ
  if (candyElement.style.pointerEvents === 'none') return;

  // タップされたら消える演出（小さくフェードアウト）
  candyElement.style.pointerEvents = 'none';
  candyElement.style.transition = 'all 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
  candyElement.style.transform = 'scale(0)';
  candyElement.style.opacity = '0';

  // スコア加算
  score++;
  scoreText.innerText = score;

  // すべてのお菓子（3個）をあつめたらクリア！
  if (score === maxScore) {
    setTimeout(() => {
      clearMessage.style.display = 'block';
    }, 400); // すこし余韻を置いてからお祝い
  }
}

// ゲームリセット処理
function resetGame() {
  score = 0;
  scoreText.innerText = score;
  clearMessage.style.display = 'none';
  guideOverlay.style.opacity = '1';
  candyContainer.innerHTML = ''; // 画面のお菓子を全消去
  candiesSpawned = false; // 再びマーカー検知で出現可能にする
}
