const totalFloors = 6;
const roomsPerFloor = 5;
let balance = 0;
let debt = 10000000000;

let remainingMonths = 360; // 총 360개월 (30년)

// 일 진행 관련 변수
let dayProgress = 0;
const daysInMonth = 30; // 한 달은 30일로 고정
const dayProgressIncrement = 50 / daysInMonth; // 게이지 바 증가량

const buildingElement = document.getElementById('building');
const balanceElement = document.getElementById('balance');
const debtElement = document.getElementById('debt');
const remainingMonthsElement = document.getElementById('remainingMonths');
const tenantCountElement = document.getElementById('tenantCount');
const rollDiceButton = document.getElementById('rollDice');
const diceResultElement = document.getElementById('diceResult');
const diceImage = document.getElementById('diceImage');
const eventList = document.getElementById('eventList');
const monthlyIncomeElement = document.getElementById('monthlyIncome');
const resetGameButton = document.getElementById('resetGame');
const dayProgressBar = document.getElementById('dayProgressBar');

let rooms = [];
let monthlyIncome = 0; // 이번 달 예상 월세 수익
let timerIntervalId; // 타이머 인터벌 ID
let isRollingDice = false; // 주사위 굴리기 상태 추적 변수

// 랜덤 금액 생성 함수
function getRandomAmount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 랜덤 계약 기간 생성 함수
function getRandomContractPeriod() {
    return getRandomAmount(3, 24);
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
                contractPeriod: 0, // 계약 기간 추가
                tenantElement: null,
                rentDisplayElement: null,
                contractDisplayElement: null,
            });
        }
        buildingElement.appendChild(floor);
        rooms.push(...floorRooms);
    }

    // 게임 시작 시 세입자 3명 입주
    for (let i = 0; i < 10; i++) {
        tenantMoveIn();
    }

    updateTenantCount(); // 세입자 수 업데이트
    updateMonthlyIncome(); // 월세 수익 업데이트
}

// 랜덤 월세 생성 함수
function getRandomRent(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 세입자 입주 함수 수정
function tenantMoveIn() {
    const vacantRooms = rooms.filter(room => !room.occupied);
    if (vacantRooms.length > 0) {
        const room = vacantRooms[Math.floor(Math.random() * vacantRooms.length)];
        room.occupied = true;
        room.element.classList.remove('vacant');
        room.element.classList.add('occupied');

        // 랜덤 월세 설정 (800,000원 ~ 1,500,000원 사이)
        room.rent = getRandomRent(500000, 3000000);

        // 계약 기간 설정 (3~12개월)
        room.contractPeriod = getRandomContractPeriod();

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

        // 계약 기간 표시
        const contractDisplay = document.createElement('div');
        contractDisplay.classList.add('contract-display');
        contractDisplay.textContent = `${room.contractPeriod}개월`;
        room.element.appendChild(contractDisplay);
        room.contractDisplayElement = contractDisplay;

        // 세입자 클릭 이벤트 리스너 추가
        addTenantClickListener(room);

        updateTenantCount(); // 세입자 수 업데이트
        updateMonthlyIncome(); // 월세 수익 업데이트
    }
}

// 특정 방의 세입자를 퇴거시키는 함수
function tenantMoveOutFromRoom(room) {
    if (room.occupied) {
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
        if (room.contractDisplayElement) {
            room.element.removeChild(room.contractDisplayElement);
            room.contractDisplayElement = null;
        }

        // 월세 및 계약 기간 초기화
        room.rent = 0;
        room.contractPeriod = 0;

        updateTenantCount(); // 세입자 수 업데이트
        updateMonthlyIncome(); // 월세 수익 업데이트
    }
}

// 세입자 클릭 이벤트 리스너 추가
function addTenantClickListener(room) {
    if (room.tenantElement) {
        room.tenantElement.style.cursor = 'pointer'; // 커서를 포인터로 변경
        room.tenantElement.addEventListener('click', (event) => {
            event.stopPropagation(); // 이벤트 버블링 방지
            tenantMoveOutFromRoom(room);
            addEventLog('세입자를 퇴거시켰습니다.');
        });
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

// 계약 기간 감소 및 만료 처리 함수
function updateContractPeriods() {
    rooms.forEach(room => {
        if (room.occupied) {
            room.contractPeriod--;
            if (room.contractDisplayElement) {
                room.contractDisplayElement.textContent = `${room.contractPeriod}개월`;
            }
            if (room.contractPeriod <= 0) {
                // 계약 기간 만료, 세입자 퇴거
                tenantMoveOutFromRoom(room);
                addEventLog('세입자의 계약 기간이 만료되어 퇴거했습니다.');
            }
        }
    });
}

// 월세 수령
function collectRent() {
    // 월세 수령 및 잔액 업데이트
    rooms.forEach(room => {
        if (room.occupied) {
            balance += room.rent; // 월세 수익을 잔액에 추가
        }
    });

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
            // 세입자 1~5명 입주
            {
                const vacantRooms = rooms.filter(room => !room.occupied);
                if (vacantRooms.length > 0) {
                    const maxTenantsToMoveIn = Math.min(5, vacantRooms.length);
                    const tenantsToMoveIn = getRandomAmount(1, maxTenantsToMoveIn);
                    tenantMoveInCustom(tenantsToMoveIn);
                    eventMessage = `새로운 세입자 ${tenantsToMoveIn}명이 입주했습니다.`;
                } else {
                    eventMessage = '건물이 가득 찼습니다. 새로운 세입자를 받을 수 없습니다.';
                }
            }
            break;
        case 2:
            const cleaningCost = getRandomAmount(5000000, 10000000);
            balance -= cleaningCost;
            eventMessage = `건물 청소비로 ₩${cleaningCost.toLocaleString()}원이 지출되었습니다.`;
            break;
        case 3:
            // 건물 수리 필요
            const repairCost = getRandomAmount(5000000, 15000000);
            balance -= repairCost;
            eventMessage = `건물 수리비로 ₩${repairCost.toLocaleString()}원이 지출되었습니다.`;
            break;
        case 4:
            // 랜덤 이벤트 (부정적)
            const taxCost = getRandomAmount(5000000, 20000000);
            balance -= taxCost;
            eventMessage = `건물 세금으로 ₩${taxCost.toLocaleString()}원이 지출되었습니다.`;
            break;
        case 5:
            // 랜덤 이벤트 (부정적)
            const accidentCost = getRandomAmount(5000000, 25000000);
            balance -= accidentCost;
            eventMessage = `건물 사고로 ₩${accidentCost.toLocaleString()}원이 지출되었습니다.`;
            break;
        case 6:
            // 정부 지원금 받기 (랜덤 금액)
            const subsidyAmount = getRandomAmount(10000000, 20000000);
            balance += subsidyAmount;
            eventMessage = `정부 지원금으로 ₩${subsidyAmount.toLocaleString()}원을 받았습니다.`;
            break;
    }
    addEventLog(eventMessage);
}

// 지정된 수의 세입자를 입주시키는 함수
function tenantMoveInCustom(count) {
    const vacantRooms = rooms.filter(room => !room.occupied);
    if (vacantRooms.length > 0) {
        const tenantsToMoveIn = Math.min(count, vacantRooms.length);
        for (let i = 0; i < tenantsToMoveIn; i++) {
            tenantMoveIn();
        }
    }
}

// 게임 상태를 저장하는 함수
function saveGameState() {
    const gameState = {
        rooms: rooms.map(room => ({
            occupied: room.occupied,
            rent: room.rent,
            contractPeriod: room.contractPeriod
        })),
        balance: balance,
        debt: debt,
        remainingMonths: remainingMonths,
        dayProgress: dayProgress
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// 게임 상태를 불러오는 함수 수정
function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);

        // 시간, 잔액, 빚 복원
        balance = gameState.balance || 0;
        debt = gameState.debt || 10000000000;
        remainingMonths = gameState.remainingMonths || 480;
        dayProgress = gameState.dayProgress || 0;

        balanceElement.textContent = `₩${balance.toLocaleString()}`;
        debtElement.textContent = `₩${debt.toLocaleString()}`;
        remainingMonthsElement.textContent = remainingMonths;
        dayProgressBar.style.width = `${dayProgress}%`;

        // 방 상태 복원
        if (gameState.rooms && gameState.rooms.length === rooms.length) {
            gameState.rooms.forEach((savedRoom, index) => {
                const room = rooms[index];
                room.occupied = savedRoom.occupied;
                room.rent = savedRoom.rent;
                room.contractPeriod = savedRoom.contractPeriod;

                // 기존의 세입자 및 월세 표시 요소 제거
                if (room.tenantElement) {
                    room.element.removeChild(room.tenantElement);
                    room.tenantElement = null;
                }
                if (room.rentDisplayElement) {
                    room.element.removeChild(room.rentDisplayElement);
                    room.rentDisplayElement = null;
                }
                if (room.contractDisplayElement) {
                    room.element.removeChild(room.contractDisplayElement);
                    room.contractDisplayElement = null;
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

                    // 계약 기간 표시
                    const contractDisplay = document.createElement('div');
                    contractDisplay.classList.add('contract-display');
                    contractDisplay.textContent = `${room.contractPeriod}개월`;
                    room.element.appendChild(contractDisplay);
                    room.contractDisplayElement = contractDisplay;

                    // 세입자 클릭 이벤트 리스너 추가
                    addTenantClickListener(room);
                } else {
                    room.element.classList.remove('occupied');
                    room.element.classList.add('vacant');
                    room.tenantElement = null;
                    room.rentDisplayElement = null;
                    room.contractDisplayElement = null;
                }
            });
        }

        updateTenantCount(); // 세입자 수 업데이트
        updateMonthlyIncome(); // 월세 수익 업데이트
    } else {
        // 저장된 상태가 없으면 초기값 설정
        balanceElement.textContent = `₩${balance.toLocaleString()}`;
        debtElement.textContent = `₩${debt.toLocaleString()}`;
        remainingMonthsElement.textContent = remainingMonths;
        dayProgressBar.style.width = `${dayProgress}%`;

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
    dayProgress += dayProgressIncrement;
    if (dayProgress >= 100) {
        dayProgress = 0;

        // 월말 처리
        collectRent(); // 월세 수령
        updateContractPeriods(); // 계약 기간 업데이트

        // 잔액 및 남은 빚 업데이트
        debt -= balance;
        balance = 0;

        balanceElement.textContent = `₩${balance.toLocaleString()}`;
        debtElement.textContent = `₩${debt.toLocaleString()}`;

        // 남은 개월 수 감소
        remainingMonths--;
        if (remainingMonths <= 0) {
            remainingMonths = 0;
            // 게임 종료 조건 (실패)
            if (debt > 0) {
                addEventLog('빚을 갚지 못해 은행이 건물을 가져갔습니다.');
                diceImage.src = `failure.png`;
                rollDiceButton.disabled = true;
                resetGameButton.disabled = false; // 초기화 버튼 활성화
                clearInterval(timerIntervalId); // 자동 시간 진행 중지
                return;
            }
        }

        remainingMonthsElement.textContent = remainingMonths;
    }

    dayProgressBar.style.width = `${dayProgress}%`;

    // 게임 상태 저장
    saveGameState();

    // 게임 종료 조건 (성공)
    if (debt <= 0) {
        addEventLog('축하합니다! 빚을 모두 갚았습니다!');
        diceImage.src = `success.png`;
        rollDiceButton.disabled = true;
        resetGameButton.disabled = false; // 초기화 버튼 활성화
        clearInterval(timerIntervalId); // 자동 시간 진행 중지
        return;
    }
}

// 주사위 굴리기 함수
function rollDice() {
    if (debt <= 0 || remainingMonths <= 0 || isRollingDice) return; // 게임이 종료되었거나 주사위가 굴러가는 중이면 동작하지 않음

    isRollingDice = true; // 주사위 굴리기 시작
    rollDiceButton.disabled = true;
    rollDiceAnimation((diceValue) => {
        diceResultElement.textContent = diceValue;

        handleEvent(diceValue);

        // 잔액 및 남은 빚 업데이트
        balanceElement.textContent = `₩${balance.toLocaleString()}`;
        debtElement.textContent = `₩${debt.toLocaleString()}`;

        // 게임 상태 저장
        saveGameState();

        // 게임 종료 조건 (성공)
        if (debt <= 0) {
            addEventLog('축하합니다! 빚을 모두 갚았습니다!');
            rollDiceButton.disabled = true;
            resetGameButton.disabled = false; // 초기화 버튼 활성화
            clearInterval(timerIntervalId); // 자동 시간 진행 중지
        } else {
            rollDiceButton.disabled = false;
        }

        isRollingDice = false; // 주사위 굴리기 종료
    });
}

// 주사위 굴리기 버튼 클릭 시
rollDiceButton.addEventListener('click', rollDice);

// 키보드 이벤트 리스너 추가 ('d' 키로 주사위 굴리기)
document.addEventListener('keydown', (event) => {
    if ((event.key === 'd' || event.key === 'D') && !isRollingDice) {
        rollDice();
    }
});

// 게임 시작
createBuilding();
loadGameState(); // 게임 상태 불러오기

// 게임 초기화 버튼 이벤트 리스너 추가
resetGameButton.addEventListener('click', resetGameState);

// 자동 시간 진행 인터벌 설정
timerIntervalId = setInterval(() => {
    if (debt > 0 && remainingMonths > 0) {
        autoAdvanceTime();
    } else {
        clearInterval(timerIntervalId);
    }
}, 100); // 100ms마다 시간 진행 (더 세밀한 진행을 위해)

// 페이지가 포커스를 잃었다가 다시 얻을 때 게이지 바 재동기화
window.addEventListener('focus', () => {
    dayProgressBar.style.width = `${dayProgress}%`;
});
