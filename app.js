// ==========================================
// 【★デザイン差し替え用：アセットパスの設定★】
// あなたが描いたお菓子イラストやマーカーのファイルパスをここに指定してください。
// ==========================================
const ASSETS = {
  marker: './assets/marker-obake.png', // 添付いただいたオバケの画像
  candies: [
    './assets/candy_01.png',          // お菓子の画像1 (キャンディなど)
    './assets/candy_02.png',          // お菓子の画像2 (チョコなど)
    './assets/candy_03.png'           // お菓子の画像3 (カボチャなど)
  ]
};

const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading');
const clearMessage = document.getElementById('clear-message');
const guideOverlay = document.getElementById('guide-overlay');
const scoreText = document.getElementById('score');

let hands, markerImageObj, candyImageObjs = [];
let markerFeatures = null;
let gameScore = 0;
let isCleared = false;

// ゲームで出現させるお菓子の状態管理
let currentCandies = [];

// 画面のリサイズ
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// アセット（画像）の読み込み
async function loadAssets() {
  // 1. マーカー画像を読み込む
  markerImageObj = new Image();
  markerImageObj.src = ASSETS.marker;
  await new Promise(resolve => markerImageObj.onload = resolve);

  // 2. お菓子の画像をすべて読み込む
  for (let src of ASSETS.candies) {
    const img = new Image();
    img.src = src;
    await new Promise(resolve => img.onload = resolve);
    candyImageObjs.push(img);
  }
}

// ARマーカー上に表示するお菓子データを生成
function setupCandies(markerX, markerY, markerWidth, markerHeight) {
  currentCandies = [];
  // マーカー（オバケ）の周辺にお菓子を3つ配置
  const offsets = [
    { dx: -markerWidth * 0.4, dy: -markerHeight * 0.4 },
    { dx: markerWidth * 0.4,  dy: -markerHeight * 0.4 },
    { dx: 0,                  dy: -markerHeight * 0.7 }
  ];

  for (let i = 0; i < candyImageObjs.length; i++) {
    currentCandies.push({
      id: i,
      x: markerX + offsets[i].dx,
      y: markerY + offsets[i].dy,
      img: candyImageObjs[i],
      size: 70, // 【★デザイン差し替え用：お菓子の表示サイズ★】
      active: true
    });
  }
}

// 簡単なテンプレートマッチングによる簡易画像トラッキング（オバケマーカーを見つける処理）
function detectMarker(videoFrame) {
  // ※実務ではOpenCV.jsなどを用いて、videoFrameからmarkerImageObjの位置(x, y, w, h)を特定します。
  // ここではカメラの中央付近にオバケのマーカーが写ったと仮定して、ARお菓子のアンカー（位置）を返します。
  
  // デモ用として、カメラ中央にマーカーがある前提でトラッキング座標を仮決定します。
  // 実際はマーカーが写ると、そのバウンディングボックスの内部に補正されます。
  const rect = {
    x: canvas.width / 2,
    y: canvas.height / 2 + 50,
    width: 220,
    height: 220
  };
  
  // マーカーが検知されている間はガイドを消す
  guideOverlay.style.opacity = '0';
  return rect;
}

// 衝突判定用（指先とお菓子の距離）
function checkCollision(x1, y1, x2, y2, size) {
  const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  return dist < size;
}

// MediaPipe Hands の解析結果 + 描画処理
function onResults(results) {
  if (loadingScreen) loadingScreen.classList.add('hidden');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. マーカー（オバケ）を追跡して、その位置にお菓子をセット
  const markerPos = detectMarker(video);
  if (markerPos && currentCandies.length === 0 && !isCleared) {
    setupCandies(markerPos.x, markerPos.y, markerPos.width, markerPos.height);
  }

  // 2. お菓子の描画
  currentCandies.forEach(candy => {
    if (candy.active) {
      // 魔法のオーラ（影）を描画
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 20;
      ctx.drawImage(
        candy.img, 
        candy.x - candy.size / 2, 
        candy.y - candy.size / 2, 
        candy.size, 
        candy.size
      );
      ctx.shadowBlur = 0; // シャドウ効果をリセット
    }
  });

  // 3. 手の検出とお菓子を消す処理
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      // 人差し指の指先（INDEX_FINGER_TIP = 8）
      const fingerTip = landmarks[8];
      const fingerX = fingerTip.x * canvas.width;
      const fingerY = fingerTip.y * canvas.height;

      // 【★デザイン差し替え用：タッチした時の指先の目印エフェクト★】
      ctx.fillStyle = '#ff7a00';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(fingerX, fingerY, 15, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // 指先とお菓子の当たり判定
      currentCandies.forEach(candy => {
        if (candy.active) {
          if (checkCollision(fingerX, fingerY, candy.x, candy.y, candy.size)) {
            candy.active = false;
            gameScore++;
            scoreText.innerText = gameScore;

            if (gameScore === candyImageObjs.length) {
              triggerClear();
            }
          }
        }
      });
    }
  }
}

function triggerClear() {
  if (!isCleared) {
    isCleared = true;
    clearMessage.classList.remove('hidden');
    clearMessage.classList.add('flex');
  }
}

function resetGame() {
  gameScore = 0;
  isCleared = false;
  scoreText.innerText = gameScore;
  clearMessage.classList.add('hidden');
  clearMessage.classList.remove('flex');
  guideOverlay.style.opacity = '1';
  currentCandies = [];
}

// メイン初期化
async function init() {
  await loadAssets();

  hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
  });

  hands.onResults(onResults);

  // 外カメラ（背面カメラ）の起動
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    video.srcObject = stream;

    video.addEventListener('loadedmetadata', () => {
      async function predict() {
        if (!video.paused && !video.ended) {
          await hands.send({ image: video });
        }
        requestAnimationFrame(predict);
      }
      predict();
    });
  } catch (err) {
    alert("カメラの起動に失敗しました。ブラウザの設定でカメラとセンサーの権限を許可してください。");
  }
}

// ゲーム起動
init();