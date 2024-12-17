// script.js

document.addEventListener('DOMContentLoaded', () => {
    const totalCards = 40; // 총 카드 수
    const pairCount = totalCards / 2; // 카드 쌍 수
    let images = [];
    let flippedCards = [];
    let matchedCards = [];
    let cardPositions = []; // 카드의 초기 위치를 저장할 배열

    const gameBoard = document.getElementById('game-board');
    const hintInfo = document.getElementById('hint-info');
    const hintCountdown = document.getElementById('hint-countdown');
    const revealAllButton = document.getElementById('reveal-all');
    const startButton = document.getElementById('start-game');
    const teamList = document.getElementById('team-list');

    // 팀 모달 관련 DOM
    const teamModal = document.getElementById('team-modal');
    const teamForm = document.getElementById('team-form');
    const teamCountInput = document.getElementById('team-count');
    const teamNamesContainer = document.getElementById('team-names-container');

    // 팀 관련 변수
    let teamNames = [];
    let teamScores = [];
    let currentTeamIndex = 0;
    let gameStarted = false; // 시작 버튼 누른 뒤 게임 진행중인지

    // 카드 이미지 배열 생성
    for (let i = 1; i <= pairCount; i++) {
        images.push(`card${i}.jpg`);
    }
    let cards = [...images, ...images];
    cards.sort(() => Math.random() - 0.5);

    function createCard(image, index) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;

        const backFace = document.createElement('div');
        backFace.classList.add('back-face');
        backFace.textContent = index + 1;

        const cardImage = document.createElement('img');
        cardImage.src = `images/${image}`;

        card.appendChild(backFace);
        card.appendChild(cardImage);

        card.addEventListener('click', () => {
            if (flippedCards.length < 2 && !card.classList.contains('flipped') && !matchedCards.includes(card)) {
                flipCard(card);
            }
        });
        return card;
    }

    function flipCard(card) {
        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        if (card1.dataset.image === card2.dataset.image) {
            matchedCards.push(card1, card2);
            flippedCards = [];

            // 매칭 성공: 현재 팀 점수+1, 턴 유지
            teamScores[currentTeamIndex]++;
            renderTeamList();

            if (matchedCards.length === cards.length) {
                alert('You win!');
                // 게임 종료 시 시작 버튼 다시 활성화
                startButton.disabled = false;
                startButton.style.opacity = '1';
                gameStarted = false; // 게임 종료
                renderTeamList(); // 별표 제거 위해 다시 렌더
            }
        } else {
            // 매칭 실패: 다음 팀으로 턴 이동
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];

                currentTeamIndex = (currentTeamIndex + 1) % teamNames.length;
                renderTeamList();
            }, 1000);
        }
    }

    function startCountdown(duration, callback) {
        hintInfo.style.display = 'flex';
        let remainingTime = duration;
        hintCountdown.textContent = remainingTime;

        const countdownInterval = setInterval(() => {
            remainingTime--;
            if (remainingTime > 0) {
                hintCountdown.textContent = remainingTime;
            } else {
                clearInterval(countdownInterval);
                hintInfo.style.display = 'none';
                callback();
            }
        }, 1000);
    }

    function revealAllCardsForHint() {
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => card.classList.add('flipped'));
        startCountdown(2, () => {
            allCards.forEach(card => {
                if (!matchedCards.includes(card)) {
                    card.classList.remove('flipped');
                }
            });
        });
    }

    function revealAllCardsForStart() {
        // 시작 버튼 비활성화
        startButton.disabled = true;
        startButton.style.opacity = '0.5';

        // 게임 시작 설정
        currentTeamIndex = 0;
        for (let i = 0; i < teamScores.length; i++) {
            teamScores[i] = 0;
        }
        gameStarted = true;
        renderTeamList();

        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => card.classList.add('flipped'));
        startCountdown(10, () => {
            allCards.forEach(card => {
                if (!matchedCards.includes(card)) {
                    card.classList.remove('flipped');
                }
            });
            // 이후 턴 진행: 매칭 성공/실패 로직에 따라 팀 변경
        });
    }

    function initializeGame() {
        const fragment = document.createDocumentFragment(); // 최적화된 카드 추가
        cards.forEach((image, index) => {
            const card = createCard(image, index);
            // 초기 위치 계산 (8열 × 5행 with 20px gaps)
            const row = Math.floor(index / 8);
            const col = index % 8;
            const top = row * 170; // 150px height + 20px gap
            const left = col * 170; // 150px width + 20px gap
            card.style.top = `${top}px`;
            card.style.left = `${left}px`;
            card.dataset.originalIndex = index; // 원래 인덱스 저장
            fragment.appendChild(card);
            cardPositions.push({ top: top, left: left });
        });
        gameBoard.appendChild(fragment);
    }

    function generateTeamNameFields(count) {
        teamNamesContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const label = document.createElement('label');
            label.textContent = `팀 ${i} 이름:`;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.required = true;
            input.name = `team-name-${i}`;
            input.maxLength = 6; // 6자 제한

            const br = document.createElement('br');
            teamNamesContainer.appendChild(label);
            teamNamesContainer.appendChild(input);
            teamNamesContainer.appendChild(br);
            teamNamesContainer.appendChild(document.createElement('br'));
        }
    }

    // 초기 2팀 기준
    generateTeamNameFields(2);

    teamCountInput.addEventListener('input', () => {
        const count = parseInt(teamCountInput.value, 10);
        if (count > 0) {
            generateTeamNameFields(count);
        }
    });

    teamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(teamForm);
        const teamCount = parseInt(teamCountInput.value, 10);

        teamNames = [];
        teamScores = [];
        for (let i = 1; i <= teamCount; i++) {
            let teamName = formData.get(`team-name-${i}`) || '';
            teamName = teamName.trim().substring(0, 6); // 이름 공백 제거 및 6자 제한

            teamNames.push(teamName);
            teamScores.push(0);
        }
        teamModal.style.display = 'none';

        renderTeamList();
        initializeGame();
    });

    function renderTeamList() {
        teamList.innerHTML = '<h3>팀 목록</h3>';
        for (let i = 0; i < teamNames.length; i++) {
            const div = document.createElement('div');
            div.classList.add('team-item');
    
            const textNode = document.createTextNode(teamNames[i] + " : " + teamScores[i]);
            div.appendChild(textNode);
            
            // 현재 턴 팀 표시
            if (gameStarted && i === currentTeamIndex) {
                const iconSpan = document.createElement('span');
                iconSpan.classList.add('turn-arrow');
                iconSpan.textContent = '➜';
                div.appendChild(iconSpan);
            }
    
            // 팀명 클릭 시 해당 팀 차례로 변경
            div.addEventListener('click', () => {
                if (gameStarted) {
                    currentTeamIndex = i;
                    renderTeamList(); 
                    // 여기서부터 해당 팀 턴으로 진행됨
                }
            });
    
            teamList.appendChild(div);
        }
    }

    revealAllButton.addEventListener('click', revealAllCardsForHint);
    startButton.addEventListener('click', revealAllCardsForStart);

    // **** 섞기 버튼 관련 코드 ****
    const shuffleButton = document.getElementById('shuffle-cards');

    shuffleButton.addEventListener('click', () => {
        if (matchedCards.length === cards.length) {
            alert('모든 카드를 매칭하셨습니다!');
            return;
        }
        shuffleUnmatchedCardsWithAnimation();
    });

    function shuffleUnmatchedCardsWithAnimation() {
        const allCards = Array.from(gameBoard.children);
        const matchedSet = new Set(matchedCards);
        const unmatchedCards = allCards.filter(card => !matchedSet.has(card));

        if (unmatchedCards.length === 0) {
            alert('섞을 카드가 없습니다!');
            return;
        }

        // Calculate center position
        const centerX = (gameBoard.clientWidth - 150) / 2; // 1340 / 2 - 150 / 2 = 595px
        const centerY = (gameBoard.clientHeight - 150) / 2; // 830 / 2 - 150 / 2 = 325px

        // Move all unmatched cards to center with slight offsets to prevent complete overlap
        unmatchedCards.forEach((card, index) => {
            // Calculate slight offsets based on index to distribute cards around the center
            const angle = (2 * Math.PI / unmatchedCards.length) * index;
            const offset = 30; // Slight offset to prevent complete overlap
            const targetX = centerX + offset * Math.cos(angle);
            const targetY = centerY + offset * Math.sin(angle);
            card.style.top = `${targetY}px`;
            card.style.left = `${targetX}px`;
        });

        // Wait for the transition to complete (0.5s)
        setTimeout(() => {
            // Get new random positions
            const newPositions = getNewRandomPositions(unmatchedCards.length);

            // Move cards to new positions
            unmatchedCards.forEach((card, index) => {
                card.style.top = `${newPositions[index].top}px`;
                card.style.left = `${newPositions[index].left}px`;
                // Update cardPositions array
                const originalIndex = parseInt(card.dataset.originalIndex, 10);
                cardPositions[originalIndex] = { top: newPositions[index].top, left: newPositions[index].left };
            });
        }, 500); // Transition time in CSS
    }

    function getNewRandomPositions(unmatchedCardsCount) {
        const gridRows = 5;
        const gridCols = 8;
        const cardWidth = 150;
        const cardHeight = 150;
        const padding = 20; // gap between cards

        const totalWidth = gridCols * (cardWidth + padding) - padding; // 8*170 - 20 = 1360 - 20 = 1340px
        const totalHeight = gridRows * (cardHeight + padding) - padding; // 5*170 - 20 = 850 - 20 = 830px

        const availablePositions = [];

        // All possible positions with increased gaps
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                const posX = col * (cardWidth + padding);
                const posY = row * (cardHeight + padding);
                availablePositions.push({ top: posY, left: posX });
            }
        }

        // Remove positions occupied by matched cards
        matchedCards.forEach(card => {
            const index = Array.from(gameBoard.children).indexOf(card);
            if (index >= 0 && cardPositions[index]) {
                const pos = cardPositions[index];
                const posIndex = availablePositions.findIndex(p => p.top === pos.top && p.left === pos.left);
                if (posIndex > -1) {
                    availablePositions.splice(posIndex, 1);
                }
            }
        });

        // Remove positions already assigned in this shuffle
        const newPositions = [];
        for (let i = 0; i < unmatchedCardsCount; i++) {
            if (availablePositions.length === 0) break;
            const randIndex = Math.floor(Math.random() * availablePositions.length);
            newPositions.push(availablePositions[randIndex]);
            availablePositions.splice(randIndex, 1); // prevent duplication
        }

        return newPositions;
    }
    // **** 섞기 버튼 관련 코드 끝 ****
});
