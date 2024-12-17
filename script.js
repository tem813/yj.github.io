document.addEventListener('DOMContentLoaded', () => {
    const totalCards = 40; // 총 카드 수
    const pairCount = totalCards / 2; // 카드 쌍 수
    let images = [];
    let flippedCards = [];
    let matchedCards = [];

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
        cards.forEach((image, index) => {
            const card = createCard(image, index);
            gameBoard.appendChild(card);
        });
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
        generateTeamNameFields(parseInt(teamCountInput.value, 10));
    });

    teamForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(teamForm);
        const teamCount = parseInt(teamCountInput.value, 10);

        teamNames = [];
        teamScores = [];
        for (let i = 1; i <= teamCount; i++) {
            let teamName = formData.get(`team-name-${i}`) || '';
            teamName = teamName.substring(0, 6);

            if (teamName.length < 6) {
                teamName = teamName.padEnd(6, ' ');
            }

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
});
