class Cell {
    constructor() {
        this.hasShip = false;
        this.isHit = false;
    }
}

class Board {
    constructor(elementId, isCpu = false) {
        this.element = document.getElementById(elementId);
        this.cells = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => new Cell()));
        this.ships = [];
        this.isCpu = isCpu;
        this.generateBoardUI();
    }

    generateBoardUI() {
        this.element.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.element.appendChild(cell);
            }
        }
    }

    addEventListeners(gameInstance) {
        this.element.querySelectorAll('.cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            cell.addEventListener('click', () => {
                if (!this.isCpu) {
                    gameInstance.placePlayerShip(row, col, cell);
                } else {
                    gameInstance.playerAttack(row, col, cell);
                }
            });
        });
    }

    placeShip(row, col, size, orientation) {
        if (orientation === "horizontal") {
            for (let i = 0; i < size; i++) {
                this.cells[row][col + i].hasShip = true;
            }
        } else {
            for (let i = 0; i < size; i++) {
                this.cells[row + i][col].hasShip = true;
            }
        }
    }

    placeRandomShip(size) {
        let placed = false;
        while (!placed) {
            const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            if (this.canPlaceShip(size, row, col, orientation)) {
                this.placeShip(row, col, size, orientation);
                placed = true;
            }
        }
    }

    canPlaceShip(size, row, col, orientation) {
        for (let i = 0; i < size; i++) {
            const r = row + (orientation === 'vertical' ? i : 0);
            const c = col + (orientation === 'horizontal' ? i : 0);
            if (r >= 10 || c >= 10 || this.cells[r][c].hasShip) {
                return false;
            }
        }
        return true;
    }

    receiveAttack(row, col) {
        const cell = this.cells[row][col];
        if (cell.isHit) return "Ya atacado"; // Evita atacar la misma celda dos veces.

        cell.isHit = true; // Marca la celda como atacada.
        return cell.hasShip ? "Impacto" : "Agua";
    }


    allShipsSunk() {
        return this.cells.flat().every(cell => !cell.hasShip || cell.isHit);
    }
}

class Game {
    constructor() {
        this.playerBoard = new Board('player-board');
        this.cpuBoard = new Board('cpu-board', true);
        this.isPlayerTurn = true;
        this.gameOver = false;
        this.isPlacingShips = true;
        this.shipSizes = [5, 4, 3, 3, 2];
        this.currentShipIndex = 0;
        this.gameStarted = false;

        this.cpuSunk = 0;
        this.playerSunk = 0;

        this.timer = 0;
        this.timerInterval = null;

        this.placeCPUShips();
        this.playerBoard.addEventListeners(this);
        this.cpuBoard.addEventListeners(this);

        //this.startTimer();
    }

    placeCPUShips() {
        this.shipSizes.forEach(size => this.cpuBoard.placeRandomShip(size));
    }

    startTimer() {
        this.timer = 0; // Reinicia el temporizador al inicio del juego
        const timerElement = document.getElementById('timer');
        this.timerInterval = setInterval(() => {
            this.timer++;
            const minutes = String(Math.floor(this.timer / 60)).padStart(2, '0');
            const seconds = String(this.timer % 60).padStart(2, '0');
            timerElement.innerText = `${minutes}:${seconds}`;
        }, 1000); // Aumenta cada segundo
    }

    stopTimer() {
        clearInterval(this.timerInterval); // Detiene el temporizador
    }

    placePlayerShip(row, col, cell) {
        if (!this.isPlacingShips) return;

        const size = this.shipSizes[this.currentShipIndex];

        // Utiliza SweetAlert2 para preguntar por la orientación
        Swal.fire({
            title: 'Elige orientación',
            text: "¿Cómo deseas colocar el barco?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Horizontal',
            cancelButtonText: 'Vertical'
        }).then((result) => {
            const orientation = result.isConfirmed ? 'horizontal' : 'vertical';
            if (this.playerBoard.canPlaceShip(size, row, col, orientation)) {
                this.playerBoard.placeShip(row, col, size, orientation);
                for (let i = 0; i < size; i++) {
                    const r = row + (orientation === 'vertical' ? i : 0);
                    const c = col + (orientation === 'horizontal' ? i : 0);
                    this.playerBoard.element.children[r * 10 + c].classList.add('ship');
                }
                this.currentShipIndex++;
                //console.log(this.currentShipIndex);
                if (this.currentShipIndex == 4) {
                    document.getElementById('status').innerText = `Coloca tu ultimo barco...`;
                } else {
                    document.getElementById('status').innerText = `Coloca tus ${5 - this.currentShipIndex} barcos...`;
                }
                if (this.currentShipIndex === this.shipSizes.length) {
                    this.isPlacingShips = false;
                    Swal.fire({
                        icon: 'success',
                        title: 'Inicia el juego',
                        text: '¡Todos los barcos colocados!',
                        toast: true,
                        position: 'top-right',
                        timer: 2000,
                        timerProgressBar: true
                    });
                    this.startGame();
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Posicion invalida',
                    text: 'No puedes colocar un barco aqui',
                    toast: true,
                    position: 'top-right',
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        });
    }

    startGame() {
        if (this.isPlacingShips) {
            alert("Primero debes colocar todos tus barcos.");
            return;
        }
        this.gameOver = false;
        this.gameStarted = true;
        this.startTimer();
        document.getElementById('player-board').classList.add('start');
        document.getElementById('cpu-board').classList.remove('start');
        document.getElementById('status').innerText = 'Juego iniciado. Turno del jugador';
    }

    playerAttack(row, col, cell) {
        if (this.gameOver || !this.isPlayerTurn || !this.gameStarted) return;
        // Verificar si la celda ya fue atacada
        if (this.cpuBoard.cells[row][col].isHit) {
            Swal.fire({
                icon: 'warning',
                title: 'Ya has atacado esta posición',
                text: 'Intenta en otra posición.',
                toast: true,
                position: 'top-right',
                timer: 2000,
                timerProgressBar: true
            });
            return; // Evita el ataque y permite al jugador elegir de nuevo
        }
        // Ejecutar el ataque si la celda no ha sido atacada
        const result = this.cpuBoard.receiveAttack(row, col);
        //console.log(result);
        cell.classList.add(result === "Impacto" ? "hit" : "miss");

        if (result === "Impacto") this.cpuSunk += 1;

        document.getElementById('cpuSunk').innerText = this.cpuSunk;

        //console.log(this.cpuSunk);
        // this.cpuBoard.allShipsSunk()
        if (this.cpuBoard.allShipsSunk()) {
            this.gameOver = true;
            this.stopTimer();
            Swal.fire('¡Ganaste!', 'Has hundido todos los barcos Enemigos.', 'success');
            document.getElementById('status').innerText = '¡Ganaste!';
            this.insertPlayer();
            return;
        }
        // Cambiar turno a la CPU después de un ataque válido
        this.isPlayerTurn = false;
        setTimeout(() => this.cpuTurn(), 1000);
        document.getElementById('status').innerText = 'Turno del enemigo';
    }

    cpuTurn() {
        let row, col, result;
        let foundHit = false;
        // Prioriza ataques alrededor de una celda ya impactada
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.playerBoard.cells[i][j].isHit && this.playerBoard.cells[i][j].hasShip) {
                    const neighbors = [
                        [i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]
                    ];
                    for (const [r, c] of neighbors) {
                        if (r >= 0 && r < 10 && c >= 0 && c < 10 && !this.playerBoard.cells[r][c].isHit) {
                            row = r;
                            col = c;
                            foundHit = true;
                            break;
                        }
                    }
                    if (foundHit) break;
                }
            }
            if (foundHit) break;
        }

        // Si no se encontraron celdas adyacentes para atacar, sigue atacando aleatoriamente
        if (!foundHit) {
            do {
                row = Math.floor(Math.random() * 10);
                col = Math.floor(Math.random() * 10);
                result = this.playerBoard.receiveAttack(row, col);
            } while (result === "Ya atacado");
        } else {
            result = this.playerBoard.receiveAttack(row, col);
        }
        // Actualiza la interfaz
        const cell = this.playerBoard.element.children[row * 10 + col];
        cell.classList.add(result === "Impacto" ? "hit" : "miss");

        if (result === "Impacto") this.playerSunk += 1;
        document.getElementById('playerSunk').innerText = this.playerSunk;

        if (this.playerBoard.allShipsSunk()) {
            document.getElementById('status').innerText = '¡El enemigo ha ganado!';
            this.stopTimer();

            let fd = new FormData();
            fd.append('nombre', "CPU");
            fd.append('gano', 0);
            fd.append('timer', document.getElementById('timer').innerText);
            let request = new XMLHttpRequest();
            request.open('POST', 'api/insertPlayer.php', true);
                
            request.send(fd);
            this.gameOver = true;
            Swal.fire({
                title: 'Game Over',
                text: '¿Qué deseas hacer?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Volver a jugar',
                cancelButtonText: 'Menú principal',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    location.reload();
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    window.location.href = ':/';
                }
            });
        } else {
            this.isPlayerTurn = true;
            document.getElementById('status').innerText = 'Tu turno';
        }
    }

    insertPlayer() {
        (async () => {
            const { value: nombre } = await Swal.fire({
                icon: 'success',
                title: '¡Has ganado!',
                text: 'Por favor, ingresa tu nombre',
                input: 'text',
                inputPlaceholder: 'Ingresa tu nombre',
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Enviar',
                background: '#232323',
                color: '#fff'
            });
            const nombreJugador = nombre ? nombre : 'Anónimo';
            let fd = new FormData();
            fd.append('nombre', nombreJugador);
            fd.append('gano', 1);
            fd.append('timer', document.getElementById('timer').innerText);
            let request = new XMLHttpRequest();
            request.open('POST', 'api/insertPlayer.php', true);
            request.onload = function () {
                if (request.readyState == 4 && request.status == 200) {
                    console.log(request);
                    let response = JSON.parse(request.responseText);
                    if (response.state) {
                        (async () => {
                            await Swal.fire({
                                icon: 'success',
                                title: 'Ganaste',
                                text: `¡Felicidades, ${nombreJugador}! ¿Qué deseas hacer?`,
                                background: '#232323',
                                color: '#fff',
                                showCancelButton: true,
                                confirmButtonText: 'Volver a jugar',
                                cancelButtonText: 'Menú principal',
                                reverseButtons: true
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    location.reload();
                                } else if (result.dismiss === Swal.DismissReason.cancel) {
                                    window.location.href = './';
                                }
                            });
                        })();
                    } else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Error',
                            text: response.detail || 'No se pudo registrar tu nombre.',
                            background: '#232323',
                            color: '#fff',
                            toast: true,
                            position: 'bottom-end',
                            timer: 5000,
                            timerProgressBar: true
                        });
                    }
                }
            };
            request.send(fd);
        })();

    }

}

document.addEventListener("DOMContentLoaded", () => new Game());