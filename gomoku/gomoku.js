const BOARD_SIZE = 15;
const CELL_COUNT = BOARD_SIZE - 1;
let currPlayer = 1;
let gameEnd = false;

const occupiedPositions = [];
const occupiedBlack = [];
const occupiedWhite = [];

const table = document.getElementById('game-board');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset-btn');
const toast = document.getElementById('toast');
let toastTimer = null;

for (let i = 0; i < BOARD_SIZE; i++) {
    occupiedBlack.push(Array(BOARD_SIZE).fill(0));
    occupiedWhite.push(Array(BOARD_SIZE).fill(0));
}

for (let i = 0; i < CELL_COUNT; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < CELL_COUNT; j++) {
        const cell = document.createElement('td');
        row.appendChild(cell);
    }
    table.appendChild(row);
}

function getCellSize() {
    const sampleCell = table.querySelector('td');
    if (!sampleCell) {
        return 30;
    }
    return sampleCell.getBoundingClientRect().width;
}

table.addEventListener('click', function(event) {
    if (gameEnd) {
        showToast("The game has ended.", "error");
        return;
    }

    const rect = table.getBoundingClientRect();
    const cellSize = getCellSize();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const x_abs = Math.round(x / cellSize);
    const y_abs = Math.round(y / cellSize);

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        return;
    }

    if (x_abs < 0 || y_abs < 0 || x_abs >= BOARD_SIZE || y_abs >= BOARD_SIZE) {
        return;
    }

    const x_real = x_abs * cellSize;
    const y_real = y_abs * cellSize;

    createStone(x_real, y_real, x_abs, y_abs);
});

function createStone(x, y, x_abs, y_abs) {
    console.log('createStone function called');

    if (isOccupied(x_abs, y_abs)) {
        showToast("That intersection is already occupied.", "error");
        return;
    }

    if (currPlayer === 1) {
        occupiedBlack[x_abs][y_abs] = 1;
        const hasWin = hasFiveInRow(occupiedBlack);
        const isForbidden = !hasWin && createsDoubleThreat(occupiedBlack, x_abs, y_abs);
        occupiedBlack[x_abs][y_abs] = 0;
        if (isForbidden) {
            showToast("Illegal move: double three/four is not allowed.", "error");
            return;
        }
    }

    occupiedPositions.push({x_abs, y_abs});

    const circle = document.createElement("div");
    circle.className = "circle";
    circle.style.left = x + "px";
    circle.style.top = y + "px";

    if (currPlayer === 1) {
        circle.classList.add('stone-black');
        occupiedBlack[x_abs][y_abs] = 1;
    } else {
        circle.classList.add('stone-white');
        occupiedWhite[x_abs][y_abs] = 1;
    }
    document.getElementById("game-board").appendChild(circle);

    if (checkWin()) {
        return;
    }

    currPlayer = currPlayer === 1 ? 2 : 1;
    updateStatus();
}

function isOccupied(x, y) {
    return occupiedPositions.some(position => position.x_abs === x && position.y_abs === y);
}

function checkWin() {
    const board = currPlayer === 1 ? occupiedBlack : occupiedWhite;
    if (hasFiveInRow(board)) {
        const winText = currPlayer === 1 ? "Black wins!" : "White wins!";
        gameEnd = true;
        updateStatus(winText);
        showToast(winText, "win");
        return true;
    }
    console.log("No winner yet...");
    return false;
}

function hasFiveInRow(board) {
    const directions = [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1]
    ];
    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            if (!board[x][y]) {
                continue;
            }
            for (const [dx, dy] of directions) {
                let count = 1;
                let nx = x + dx;
                let ny = y + dy;
                while (inBounds(nx, ny) && board[nx][ny]) {
                    count += 1;
                    nx += dx;
                    ny += dy;
                }
                nx = x - dx;
                ny = y - dy;
                while (inBounds(nx, ny) && board[nx][ny]) {
                    count += 1;
                    nx -= dx;
                    ny -= dy;
                }
                if (count >= 5) {
                    return true;
                }
            }
        }
    }
    return false;
}

function createsDoubleThreat(board, x, y) {
    const directions = [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1]
    ];
    let openThrees = 0;
    let openFours = 0;
    for (const [dx, dy] of directions) {
        const info = countLine(board, x, y, dx, dy);
        if (info.length === 3 && info.openEnds === 2) {
            openThrees += 1;
        }
        if (info.length === 4 && info.openEnds === 2) {
            openFours += 1;
        }
    }
    return openThrees >= 2 || openFours >= 2;
}

function countLine(board, x, y, dx, dy) {
    let length = 1;
    let openEnds = 0;
    let nx = x + dx;
    let ny = y + dy;
    while (inBounds(nx, ny) && board[nx][ny]) {
        length += 1;
        nx += dx;
        ny += dy;
    }
    if (inBounds(nx, ny) && isEmptyIntersection(nx, ny)) {
        openEnds += 1;
    }
    nx = x - dx;
    ny = y - dy;
    while (inBounds(nx, ny) && board[nx][ny]) {
        length += 1;
        nx -= dx;
        ny -= dy;
    }
    if (inBounds(nx, ny) && isEmptyIntersection(nx, ny)) {
        openEnds += 1;
    }
    return { length, openEnds };
}

function isEmptyIntersection(x, y) {
    return !occupiedBlack[x][y] && !occupiedWhite[x][y];
}

function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;
}

function showToast(message, tone = "info") {
    if (!toast) {
        return;
    }
    if (toastTimer) {
        clearTimeout(toastTimer);
    }
    toast.textContent = message;
    toast.classList.remove('is-error', 'is-win');
    if (tone === "error") {
        toast.classList.add('is-error');
    } else if (tone === "win") {
        toast.classList.add('is-win');
    }
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 2200);
}

function updateStatus(message) {
    if (!statusText) {
        return;
    }
    if (message) {
        statusText.textContent = message;
        return;
    }
    statusText.textContent = currPlayer === 1 ? "Black to move" : "White to move";
}

function resetGame() {
    occupiedPositions.length = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (occupiedBlack[i]) {
                occupiedBlack[i][j] = 0;
            }
            if (occupiedWhite[i]) {
                occupiedWhite[i][j] = 0;
            }
        }
    }
    document.querySelectorAll('.circle').forEach((stone) => stone.remove());
    currPlayer = 1;
    gameEnd = false;
    updateStatus();
    showToast("Board reset. Black to move.", "info");
}

if (resetButton) {
    resetButton.addEventListener('click', resetGame);
}

updateStatus();
