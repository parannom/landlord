const totalFloors = 5;
const roomsPerFloor = 4;
let balance = 0;
let debt = 10000000000;
let year = 2023;
let month = 1;
let day = 1;

const buildingElement = document.getElementById('building');
const balanceElement = document.getElementById('balance');
const debtElement = document.getElementById('debt');
const yearElement = document.getElementById('year');
const monthElement = document.getElementById('month');
const dayElement = document.getElementById('day');
const tenantCountElement = document.getElementById('tenantCount'); // 세입자 수 표시 엘리먼트
const rollDiceButton = document.getElementById('rollDice');
const diceResultElement = document.getElementById('diceResult');
const diceImage = document.getElementById('diceImage');
const eventList = document.getElementById('eventList');
const monthlyIncomeElement = document.getElementById('monthlyIncome');
const resetGameButton = document.getElementById('resetGame');

let rooms = [];
let monthlyIncome = 0; // 이번 달 예상 월세 수익
let timerIntervalId; // 타이머 인터벌 ID

// 랜덤 금액 생성 함수
function getRandomAmount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 월의 일수 반환 함수 (윤년 고려)
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

// 건물 생성
function createBuilding() {
    for (let i = totalFloors; i > 0; i--) {
        const floor = document.createElement('div');
        floor.classList.add('floor');
        let floorRooms = [];
        for (let j = 0; j < roomsPerFloor; j++) {
            const room = document.createElement('div');
            room.classList.add('room', 'vacant');
            floor.appendChild(room);
            floorRooms.push({
                element: room,
                occupied: false,
                rent: 0, // 초기 월세는 0으로 설정
                tenantElement: null,
                rentDisplayElement: null,
            });
        }
        buildingElement.appendChild(floor);
        rooms.push(...floorRooms);
    }

    // 게임 시작 시 세입자 3명 입주
    for (let i = 0; i < 3; i++) {
        tenantMoveIn();
    }

    updateTenantCount(); // 세입자 수 업데이트
    updateMonthlyIncome(); // 월세 수익 업데이트
}

// 랜덤 월세 생성 함수
function getRandomRent(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 세입자 입주
function tenantMoveIn() {
    const vacantRooms = rooms.filter(room => !room.occupied);
    if (vacantRooms.length > 0) {
        const room = vacantRooms[Math.floor(Math.random() * vacantRooms.length)];
        room.occupied = true;
        room.element.classList.remove('vacant');
        room.element.classList.add('occupied');

        // 랜덤 월세 설정 (800,000원 ~ 1,500,000원 사이)
        room.rent = getRandomRent(800000, 1500000);

        // 세입자 표시
        const tenant = document.createElement('div');
        tenant.classList.add('tenant');
        tenant.textContent = '👤';
        room.element.appendChild(tenant);
        room.tenantElement = tenant;

        // 월세 표시
        const rentDisplay = document.createElement('div');
        rentDisplay.classList.add('rent-display');
        rentDisplay.textContent = `₩${room.rent.toLocaleString()}`;
        room.element.appendChild(rentDisplay);
        room.rentDisplayElement = rentDisplay;

        updateTenantCount(); // 세입자 수 업데이트
        updateMonthlyIncome(); // 월세 수익 업데이트
    }
}

// 세입자 퇴거
function tenantMoveOut() {
    const occupiedRooms = rooms.filter(room => room.occupied);
    if (occupiedRooms.length > 0) {
        const room = occupiedRooms[Math.floor(Math.random() * occupiedRooms.length)];
        room.occupied = false;
        room.element.classList.remove('occupied');
        room.element.classList.add('vacant');

        // 세입자 및 월세 표시 제거
        if (room.tenantElement) {
            room.element.removeChild(room.tenantElement);
            room.tenantElement = null;
        }
        if (room.rentDisplayElement) {
            room.element.removeChild(room.rentDisplayElement);
            room.rentDisplayElement = null;
        }

        // 월세 초기화
        room.rent = 0;

        updateTenantCount(); // 세입자 수 업데이트
        updateMonthlyIncome(); // 월세 수익 업데이트
    }
}

// 세입자 수 업데이트 함수
function updateTenantCount() {
    const tenantCount = rooms.filter(room => room.occupied).length;
    tenantCountElement.textContent = tenantCount;
}

// 월세 수익 업데이트 함수 (실시간)
function updateMonthlyIncome() {
    monthlyIncome = 0;
    rooms.forEach(room => {
        if (room.occupied) {
            monthlyIncome += room.rent;
        }
    });
    monthlyIncomeElement.textContent = `₩${monthlyIncome.toLocaleString()}`;
}

// 월세 수령
function collectRent() {
    balance += monthlyIncome; // 월세 수익을 잔액에 추가
    monthlyIncomeElement.textContent = `₩0`; // 수령 후 예상 수익 초기화
    updateMonthlyIncome(); // 다음 달 예상 수익 계산
}

// 이벤트 로그 추가
function addEventLog(message) {
    const li = document.createElement('li');
    li.textContent = message;
    eventList.insertBefore(li, eventList.firstChild);
}

// 주사위 애니메이션
function rollDiceAnimation(callback) {
    let counter = 0;
    const animationInterval = setInterval(() => {
        const randomValue = Math.floor(Math.random() * 6) + 1;
        diceImage.src = `dice${randomValue}.png`;
        counter++;
        if (counter >= 10) {
            clearInterval(animationInterval);
            callback(randomValue);
        }
    }, 100);
}

// 랜덤 이벤트 처리
function handleEvent(diceValue) {
    let eventMessage = '';
    switch (diceValue) {
        case 1:
            // 세입자 퇴거
            const hasTenants = rooms.some(room => room.occupied);
            if (hasTenants) {
                tenantMoveOut();
                eventMessage = '세입자가 퇴거했습니다.';
            } else {
                eventMessage = '아무 일도 일어나지 않았습니다.';
            }
            break;
        case 2:
            // 새로운 세입자 입주
            const vacantRooms = rooms.filter(room => !room.occupied);
            if (vacantRooms.length > 0) {
                tenantMoveIn();
                eventMessage = '새로운 세입자가 입주했습니다.';
            } else {
                eventMessage = '건물이 가득 찼습니다. 새로운 세입자를 받을 수 없습니다.';
            }
            break;
        case 3:
            // 건물 수리 필요
            const repairCost = getRandomAmount(5000000, 10000000);
            balance -= repairCost;
            eventMessage = `건물 수리가 필요하여 수리비로 ₩${repairCost.toLocaleString()}원이 지출되었습니다.`;
            break;
        case 4:
            // 정부 지원금 받기 (랜덤 금액)
            const subsidyAmount = getRandomAmount(5000000, 20000000);
            balance += subsidyAmount;
            eventMessage = `정부 지원금으로 ₩${subsidyAmount.toLocaleString()}원을 받았습니다.`;
            break;
        case 5:
            // 랜덤 이벤트 (부정적)
            const accidentCost = getRandomAmount(5000000, 15000000);
            balance -= accidentCost;
            eventMessage = `건물에 사고가 발생하여 ₩${accidentCost.toLocaleString()}원이 지출되었습니다.`;
            break;
        case 6:
            // 아무 일도 일어나지 않음
            eventMessage = '아무 일도 일어나지 않았습니다.';
            break;
    }
    addEventLog(eventMessage);
}

// 게임 상태를 저장하는 함수
function saveGameState() {
    const gameState = {
        rooms: rooms.map(room => ({
            occupied: room.occupied,
            rent: room.rent
        })),
        balance: balance,
        debt: debt,
        year: year,
        month: month,
        day: day
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// 게임 상태를 불러오는 함수
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);

        // 시간, 잔액, 빚 복원
        balance = gameState.balance || 0;
        debt = gameState.debt || 10000000000;
        year = gameState.year || 2023;
        month = gameState.month || 1;
        day = gameState.day || 1;

        balanceElement.textContent = `₩${balance.toLocaleString()}`;
        debtElement.textContent = `₩${debt.toLocaleString()}`;
        yearElement.textContent = year;
        monthElement.textContent = month;
        dayElement.textContent = day;

        // 방 상태 복원
        if (gameState.rooms && gameState.rooms.length === rooms.length) {
            gameState.rooms.forEach((savedRoom, index) => {
                const room = rooms[index];
                room.occupied = savedRoom.occupied;
                room.rent = savedRoom.rent;

                // 기존의 세입자 및 월세 표시 요소 제거
                if (room.tenantElement) {
                    room.element.removeChild(room.tenantElement);
                    room.tenantElement = null;
                }
                if (room.rentDisplayElement) {
                    room.element.removeChild(room.rentDisplayElement);
                    room.rentDisplayElement = null;
                }

                // UI 업데이트
                if (room.occupied) {
                    room.element.classList.remove('vacant');
                    room.element.classList.add('occupied');

                    // 세입자 표시
                    const tenant = document.createElement('div');
                    tenant.classList.add('tenant');
                    tenant.textContent = '👤';
                    room.element.appendChild(tenant);
                    room.tenantElement = tenant;

                    // 월세 표시
                    const rentDisplay = document.createElement('div');
                    rentDisplay.classList.add('rent-display');
                    rentDisplay.textContent = `₩${room.rent.toLocaleString()}`;
                    room.element.appendChild(rentDisplay);
                    room.rentDisplayElement = rentDisplay;
                } else {
                    room.element.classList.remove('occupied');
                    room.element.classList.add('vacant');
                    room.tenantElement = null;
                    room.rentDisplayElement = null;
                }
            });
        }

        updateTenantCount(); // 세입자 수 업데이트
        updateMonthlyIncome(); // 월세 수익 업데이트
    } else {
        // 저장된 상태가 없으면 초기값 설정
        balanceElement.textContent = `₩${balance.toLocaleString()}`;
        debtElement.textContent = `₩${debt.toLocaleString()}`;
        yearElement.textContent = year;
        monthElement.textContent = month;
        dayElement.textContent = day;

        updateTenantCount(); // 세입자 수 업데이트
        updateMonthlyIncome(); // 월세 수익 업데이트
    }
}

// 게임 상태 초기화 함수
function resetGameState() {
    localStorage.removeItem('gameState');
    clearInterval(timerIntervalId);
    location.reload();
}

// 자동 시간 진행 함수
function autoAdvanceTime() {
    day++;
    const daysInCurrentMonth = getDaysInMonth(year, month);

    if (day > daysInCurrentMonth) {
        day = 1;
        month++;
        // 월이 바뀔 때 월세 수령
        collectRent();

        // 잔액 및 남은 빚 업데이트
        debt -= balance;
        balance = 0;

        balanceElement.textContent = `₩${balance.toLocaleString()}`;
        debtElement.textContent = `₩${debt.toLocaleString()}`;

        // 게임 상태 저장
        saveGameState();

        // 게임 종료 조건
        if (debt <= 0) {
            addEventLog('축하합니다! 빚을 모두 갚았습니다!');
            rollDiceButton.disabled = true;
            resetGameButton.disabled = false; // 초기화 버튼 활성화
            clearInterval(timerIntervalId); // 자동 시간 진행 중지
        }
    }

    if (month > 12) {
        month = 1;
        year++;
    }

    yearElement.textContent = year;
    monthElement.textContent = month;
    dayElement.textContent = day;
}

// 주사위 굴리기 버튼 클릭 시
rollDiceButton.addEventListener('click', () => {
    if (debt <= 0) return; // 게임이 종료되었으면 동작하지 않음

    rollDiceButton.disabled = true;
    rollDiceAnimation((diceValue) => {
        diceResultElement.textContent = diceValue;

        handleEvent(diceValue);

        // 잔액 및 남은 빚 업데이트
        balanceElement.textContent = `₩${balance.toLocaleString()}`;
        debtElement.textContent = `₩${debt.toLocaleString()}`;

        // 게임 상태 저장
        saveGameState();

        // 게임 종료 조건
        if (debt <= 0) {
            addEventLog('축하합니다! 빚을 모두 갚았습니다!');
            rollDiceButton.disabled = true;
            resetGameButton.disabled = false; // 초기화 버튼 활성화
            clearInterval(timerIntervalId); // 자동 시간 진행 중지
        } else {
            rollDiceButton.disabled = false;
        }
    });
});

// 게임 시작
createBuilding();
loadGameState(); // 게임 상태 불러오기

// 게임 초기화 버튼 이벤트 리스너 추가
resetGameButton.addEventListener('click', resetGameState);

// 자동 시간 진행 인터벌 설정
timerIntervalId = setInterval(() => {
    if (debt > 0) {
        autoAdvanceTime();
    } else {
        clearInterval(timerIntervalId);
    }
}, 500); // 500ms마다 하루 진행
