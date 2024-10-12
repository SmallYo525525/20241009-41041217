// 定義卡片數量和組數
const totalCardsPerSet = 18;
const numberOfSets = 2;  // 兩組卡片
let gridSize = '4x4'; // 預設為 4x4
let totalCards = totalCardsPerSet * numberOfSets; // 總共36張卡片

// 預設圖片路徑
let currentImageType = '動物';
let frontImagePath = `./image/${currentImageType}/front.png`;
let backImageBasePath = `./image/${currentImageType}/`;

// 生成背面圖片路徑的陣列
let backImages = [];
for (let i = 1; i <= totalCardsPerSet; i++) {
  const imagePath = `${backImageBasePath}${String(i).padStart(2, '0')}.png`;
  backImages.push(imagePath);
}

// 選取卡片容器
const cardsContainer = document.getElementById('cards-container');

let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = false;
let matchedCards = 0;

let countdownInterval; // 倒數計時的 interval
let totalTime = 6; // 初始倒數時間
let elapsedTime = 0; // 計算玩家用時

// 隨機打亂陣列
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// 切換圖片類型
function changeImageType() {
  const selectElement = document.getElementById('imageType');
  currentImageType = selectElement.value;
  frontImagePath = `./image/${currentImageType}/front.png`;
  backImageBasePath = `./image/${currentImageType}/`;

  backImages = [];
  for (let i = 1; i <= totalCardsPerSet; i++) {
    const imagePath = `${backImageBasePath}${String(i).padStart(2, '0')}.png`;
    backImages.push(imagePath);
  }
}

// 切換卡片格式
function changeGridSize() {
  const selectElement = document.getElementById('gridSize');
  gridSize = selectElement.value;

  // 根據不同的gridSize設定初始倒數時間
  if (gridSize === '2x2') {
    totalTime = 4; // 2x2格子選擇 -> 4秒
  } else if (gridSize === '4x4') {
    totalTime = 6; // 4x4格子選擇 -> 6秒
  } else if (gridSize === '6x6') {
    totalTime = 10; // 6x6格子選擇 -> 10秒
  }

  // 更新顯示的倒數時間
  document.getElementById('timeLeft').innerText = totalTime;
}


// 開始遊戲函數
function startGame() {
  // 重置變數
  matchedCards = 0;      // 重置已匹配卡片數量
  elapsedTime = 0;       // 重置計時器的計時
  clearInterval(countdownInterval); // 清除任何存在的倒數計時器
  
  totalTime = gridSize === '2x2' ? 4 : gridSize === '4x4' ? 6 : 10; // 根據選擇的gridSize設定倒數時間
  document.getElementById('timeLeft').innerText = totalTime; // 更新顯示時間

  document.getElementById('timer').style.display = 'block'; // 顯示計時器

  let rows, cols;
  if (gridSize === '4x4') {
    rows = 4;
    cols = 4;
  } else if (gridSize === '2x2') {
    rows = 2;
    cols = 2;
  } else if (gridSize === '6x6') {
    rows = 6;
    cols = 6;
  }

  // 重新顯示所有卡片
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.display = 'block';
  });

  totalCards = rows * cols; // 根據選擇的格式計算總卡片數
  cardsContainer.innerHTML = '';
  
  // 設定 CSS grid 樣式
  cardsContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  cardsContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  // 計算所需的配對數量
  const totalPairs = totalCards / 2;

  // 隨機選擇配對的圖片並確保不重複
  const selectedImages = shuffleArray([...backImages]).slice(0, totalPairs);
  const shuffledBackImages = selectedImages.flatMap(img => [img, img]); // 每個圖片成對

  // 隨機打亂所有卡片
  const finalCards = shuffleArray(shuffledBackImages);

  for (let i = 0; i < totalCards; i++) {
    const card = document.createElement('div');
    card.classList.add('card');

    const backFace = document.createElement('div');
    backFace.classList.add('card-face', 'back');
    const backImage = document.createElement('img');
    backImage.src = finalCards[i];
    backFace.appendChild(backImage);

    const frontFace = document.createElement('div');
    frontFace.classList.add('card-face', 'front');
    const frontImage = document.createElement('img');
    frontImage.src = frontImagePath;
    frontFace.appendChild(frontImage);

    card.appendChild(backFace);
    card.appendChild(frontFace);
    card.addEventListener('click', flipCard);
    cardsContainer.appendChild(card);
  }

  flipAllToBack();
  disableCardClick();
  resetTimer();  // 更新倒數時間

  // 根據選擇的gridSize來設定倒數計時前的延遲
  const delayBeforeGameStarts = totalTime * 1000; // 乘上1000將秒轉換為毫秒

  setTimeout(() => {
    flipAllToFront();
    enableCardClick();
    startCountUp();
  }, delayBeforeGameStarts); // 這裡使用延遲時間
}




// 重置倒數計時
function resetTimer() {
  document.getElementById('timeLeft').innerText = totalTime; // 更新顯示時間
  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    totalTime--;
    document.getElementById('timeLeft').innerText = totalTime;
    if (totalTime <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}


// 開始計算玩家通關時間
function startCountUp() {
  elapsedTime = 0;
  clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    elapsedTime++;
    document.getElementById('timeLeft').innerText = elapsedTime;
  }, 1000);
}

// 卡片翻轉函數
function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add('flip');

  // 播放翻牌音效
  playSound('flip');

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }

  secondCard = this;
  checkForMatch();
}

// 檢查配對
function checkForMatch() {
  lockBoard = true; // 鎖定面板，避免同時點擊

  // 延遲判斷配對
  setTimeout(() => {
    const isMatch = firstCard.querySelector('.back img').src === secondCard.querySelector('.back img').src;

    isMatch ? disableCards() : unflipCards();
  }, 500); // 延遲 500 毫秒
}


// 禁用已配對的卡片
function disableCards() {
  lockBoard = true; // 鎖定面板

  firstCard.classList.add('hide'); // 添加隱藏動畫類別
  secondCard.classList.add('hide'); // 添加隱藏動畫類別

  // 播放配對成功音效
  playSound('success');

  matchedCards += 2;
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  setTimeout(() => {
    firstCard.style.visibility = 'hidden'; // 隱藏卡片
    secondCard.style.visibility = 'hidden'; // 隱藏卡片
    resetBoard();

    if (matchedCards === totalCards) {
      // 顯示遊戲結束的SweetAlert2視窗
      setTimeout(() => {
        // 停止倒數計時器
        clearInterval(countdownInterval);

        Swal.fire({
          title: "恭喜你！",
          text: `你花了 ${elapsedTime} 秒完成遊戲！`,
          icon: "success",
          showCancelButton: true,
          cancelButtonText: "回到首頁",
          confirmButtonText: "重新開始",
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            // 重新開始遊戲
            startGame();  // 此處重新開始遊戲並正確重置計時器
          } else if (result.isDismissed) {
            // 回到首頁
            window.location.href = window.location.origin + "/"; // 這裡可以設定為你的首頁URL
          }
        });
      }, 500); 
    }

    lockBoard = false; // 解鎖面板
  }, 500); // 動畫持續時間
}






// 翻回不匹配的卡片
function unflipCards() {
  lockBoard = true;

  // 播放配對失敗音效
  playSound('fail');

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
  }, 500);
}

// 重置遊戲狀態
function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

// 將所有卡片翻到正面
function flipAllToFront() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.classList.remove('flip');
  });
}

// 將所有卡片翻到背面
function flipAllToBack() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('flip');
    }, index * 200);
  });
}

// 禁用卡片點擊事件
function disableCardClick() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.pointerEvents = 'none';
  });
}

// 啟用卡片點擊事件
function enableCardClick() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.pointerEvents = 'auto';
  });
}


// 音效播放函數
function playSound(soundType) {
  let sound;
  
  switch (soundType) {
    case 'flip':  // 翻牌音效
      sound = new Audio('./sound/01.mp3');
      break;
    case 'fail':  // 配對失敗音效
      sound = new Audio('./sound/02.mp3');
      sound.volume = 0.3;
      break;
    case 'success':  // 配對成功音效
      sound = new Audio('./sound/03.mp3');
      sound.volume = 0.3;
      break;
    default:
      return;  // 如果沒有匹配的音效，則不播放
  }

  sound.play();  // 播放音效
}
