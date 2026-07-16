// ==========================================
// 【★デザイン差し替え用：お菓子イラストのパス★】
// ==========================================
const CANDY_IMAGE = './assets/candy_01.png';

const scoreText = document.getElementById('score');
const clearMessage = document.getElementById('clear-message');
const guideOverlay = document.getElementById('guide-overlay');
const loadingScreen = document.getElementById('loading');
const marker = document.getElementById('obake-marker');
const candyContainer = document.getElementById('candy-container');

let score = 0;
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

// 👻 Hiroマーカーをカメラが読み取った瞬間の処理！
marker.addEventListener('markerFound', () => {
  guideOverlay.style.opacity = '0'; // ガイドを隠す
  
  // まだお菓子が出ていない場合のみ、自動回収シーケンスを開始
  if (!candiesSpawned) {
    candiesSpawned = true;
    spawnAndAutoCollect();
  }
});

// マーカーを見失った時
marker.addEventListener('markerLost', () => {
  if (!candiesSpawned) {
    guideOverlay.style.opacity = '1';
  }
});

// お菓子が自動で出て、自動で吸い込まれて消える演出
function spawnAndAutoCollect() {
  candyContainer.innerHTML = ''; // コンテナをリセット

  // 1. お菓子画像を画面中央に生成
  const candyImg = document.createElement('img');
  candyImg.src = CANDY_IMAGE;
  candyImg.className = 'candy-item';
  candyContainer.appendChild(candyImg);

  // 2. 1.2秒後にお菓子を自動回収（消去）する演出をタイマー予約
  setTimeout(() => {
    collectCandyAutomatically(candyImg);
  }, 1200); // 1.2秒間ふわふわ浮かんだら消える（お好みの時間に変更可能）
}

// 自動でお菓子を消してお祝い画面を出す処理
function collectCandyAutomatically(candyElement) {
  // 自動でシュッと吸い込まれるように小さく消えるアニメーション
  candyElement.style.transition = 'all 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
  candyElement.style.transform = 'scale(0) translateY(100px)'; // 下のスコアに向かって吸い込まれる演出
  candyElement.style.opacity = '0';

  // 消去アニメーションが終わるタイミングでスコア加算とクリア画面
  setTimeout(() => {
    score = 1;
    scoreText.innerText = score;

    // ゲームクリア（1つあつめたらおしまい）
    clearMessage.style.display = 'block';
  }, 500);
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
