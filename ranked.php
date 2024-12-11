<?php
require 'files/conexion.php';
$queryJugadores = "SELECT * FROM jugadores WHERE gano = 1 ORDER BY tiempo LIMIT 0, 10";
$queryComputadora = "SELECT * FROM jugadores WHERE gano = 0 ORDER BY tiempo LIMIT 0, 10";
$resJugadores = $con->query($queryJugadores);
$resComputadora = $con->query($queryComputadora);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Battle Ship | Ranked</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div class="ocean">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
    </div>

    <main>
        <div class="menu-container list">
            <div class="head">
                <h1 class="game-title">Mejores tiempos</h1>
                <div class="tab-buttons">
                    <button class="menu-button" onclick="toggleTab('jugador')">Jugadores</button>
                    <button class="menu-button" onclick="toggleTab('computadora')">Computadora</button>
                </div>
            </div>
            <div class="ranked">
                <span>Nombre</span>
                <span>Tiempo</span>
            </div>
            <div id="jugador-tab" class="ranked-list">
                <?php while ($row = $resJugadores->fetch_assoc()) { ?>
                    <div class="ranked">
                        <span><?php echo $row['nombre']; ?></span>
                        <span><?php echo $row['tiempo']; ?></span>
                    </div>
                <?php } ?>
            </div>

            <div id="computadora-tab" class="ranked-list" style="display: none;">
                <?php while ($row = $resComputadora->fetch_assoc()) { ?>
                    <div class="ranked">
                        <span><?php echo $row['nombre']; ?></span>
                        <span><?php echo $row['tiempo']; ?></span>
                    </div>
                <?php } ?>
            </div>
        </div>
    </main>
    <button class="btn" onclick="window.location.href='./'">
        <box-icon name='home' type='solid' animation='tada' size='lg''></box-icon>
    </button>
</body>

<script>
    function toggleTab(tab) {
        const jugadorTab = document.getElementById('jugador-tab');
        const computadoraTab = document.getElementById('computadora-tab');

        if (tab === 'jugador') {
            jugadorTab.style.display = 'flex';
            computadoraTab.style.display = 'none';
        } else {
            jugadorTab.style.display = 'none';
            computadoraTab.style.display = 'flex';
        }
    }
</script>
<script src="https://unpkg.com/boxicons@2.1.4/dist/boxicons.js"></script>

</html>