CREATE TABLE `usuarios`(
    `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `nombre`      VARCHAR(255) NOT NULL,
    `email`       VARCHAR(255) NOT NULL,
    `password`    VARCHAR(255) NOT NULL,
    `tipo`        ENUM('trabajador', 'administrador') NOT NULL,
    `activo`      BOOLEAN NOT NULL,
    `fecha_alta`  DATETIME NOT NULL
);

CREATE TABLE `robots`(
    `id`                INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `codigo`            VARCHAR(255) NOT NULL,
    `modelo`            VARCHAR(255) NOT NULL,
    `estado`            ENUM('activo', 'inactivo', 'en_tarea', 'error') NOT NULL,
    `bateria_pct`       FLOAT(53) NOT NULL,
    `pos_x/pos_y/pos_z` JSON NOT NULL,
    `ultima_conexion`   DATETIME NOT NULL
);

-- Tabla intermedia N:M entre usuarios y robots
CREATE TABLE `trabajador_robot`(
    `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id_trabajador`    INT UNSIGNED NOT NULL,
    `id_robot`         INT UNSIGNED NOT NULL,
    `fecha_asignacion` DATETIME NOT NULL,
    FOREIGN KEY (`id_trabajador`) REFERENCES `usuarios`(`id`),
    FOREIGN KEY (`id_robot`)      REFERENCES `robots`(`id`)
);

CREATE TABLE `sectores`(
    `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `nombre_sector` VARCHAR(255) NOT NULL,
    `coordenadas`   JSON NOT NULL
);

CREATE TABLE `estanterias`(
    `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `codigo`          VARCHAR(255) NOT NULL,
    `coor_x/coor_y/coor_z` JSON NOT NULL,
    `nivel`           INT NOT NULL,
    `capacidad_max`   INT NOT NULL,
    `id_sector`       INT UNSIGNED NOT NULL,
    FOREIGN KEY (`id_sector`) REFERENCES `sectores`(`id`)
);

CREATE TABLE `paquetes`(
    `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `codigo_barras`  VARCHAR(255) NOT NULL,
    `descripcion`    VARCHAR(255) NOT NULL,
    `peso_kg`        FLOAT(53) NOT NULL,
    `id_estanteria`  INT UNSIGNED NOT NULL,
    `estado`         ENUM('almacenado', 'en_transito', 'entregado') NOT NULL,
    `fecha_entrada`  DATETIME NOT NULL,
    `fecha_salida`   DATETIME NOT NULL,
    FOREIGN KEY (`id_estanteria`) REFERENCES `estanterias`(`id`)
);

CREATE TABLE `tareas`(
    `id`                    INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id_robot`              INT UNSIGNED NOT NULL,
    `id_paquete`            INT UNSIGNED NOT NULL,
    `id_estanteria_origen`  INT UNSIGNED NULL,
    `id_estanteria_destino` INT UNSIGNED NULL,
    `origen`                JSON NOT NULL,
    `destino`               JSON NOT NULL,
    `estado`                ENUM('pendiente', 'en_curso', 'completada', 'cancelada') NOT NULL,
    `fecha_creacion`        DATETIME NOT NULL,
    `fecha_resolucion`      DATETIME NOT NULL,
    -- Columna generada: solo tiene valor cuando la tarea está en_curso
    `robot_en_curso`        INT UNSIGNED GENERATED ALWAYS AS (
                                IF(`estado` = 'en_curso', `id_robot`, NULL)
                            ) STORED,
    FOREIGN KEY (`id_robot`)              REFERENCES `robots`(`id`),
    FOREIGN KEY (`id_paquete`)            REFERENCES `paquetes`(`id`),
    FOREIGN KEY (`id_estanteria_origen`)  REFERENCES `estanterias`(`id`),
    FOREIGN KEY (`id_estanteria_destino`) REFERENCES `estanterias`(`id`),
    -- Impide que el mismo robot tenga dos tareas en_curso a la vez
    UNIQUE KEY `uq_robot_en_curso` (`robot_en_curso`)
);

CREATE TABLE `alertas`(
    `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id_robot`         INT UNSIGNED NOT NULL,
    `id_trabajador`    INT UNSIGNED NOT NULL,
    `tipo`             ENUM('cargar', 'dejar', 'bateria_baja', 'error') NOT NULL,
    `descripcion`      VARCHAR(255) NOT NULL,
    `estado`           ENUM('pendiente', 'atendida', 'resuelta') NOT NULL,
    `fecha_creacion`   DATETIME NOT NULL,
    `fecha_resolucion` DATETIME NOT NULL,
    FOREIGN KEY (`id_robot`)      REFERENCES `robots`(`id`),
    FOREIGN KEY (`id_trabajador`) REFERENCES `usuarios`(`id`)
);

CREATE TABLE `incidencias`(
    `id`               INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id_trabajador`    INT UNSIGNED NOT NULL,
    `id_administrador` INT UNSIGNED NOT NULL,
    `id_robot`         INT UNSIGNED NOT NULL,
    `asunto`           VARCHAR(255) NOT NULL,
    `cuerpo`           VARCHAR(255) NOT NULL,
    `estado`           ENUM('abierta', 'en_proceso', 'cerrada') NOT NULL,
    `fecha_apertura`   DATETIME NOT NULL,
    `fecha_cierre`     DATETIME NOT NULL,
    FOREIGN KEY (`id_trabajador`)    REFERENCES `usuarios`(`id`),
    FOREIGN KEY (`id_administrador`) REFERENCES `usuarios`(`id`),
    FOREIGN KEY (`id_robot`)         REFERENCES `robots`(`id`)
);