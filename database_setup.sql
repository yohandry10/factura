-- Script SQL para Sistema de Facturación Interbank - PostgreSQL
-- Crear base de datos y tablas necesarias

-- Crear base de datos (opcional, puedes usar una existente)
-- CREATE DATABASE sistema_facturacion;

-- Crear tipos ENUM para PostgreSQL
CREATE TYPE tipo_documento_enum AS ENUM ('DNI', 'CE', 'PASAPORTE');
CREATE TYPE tipo_operacion_enum AS ENUM ('DEPOSITO', 'RETIRO', 'TRANSFERENCIA');
CREATE TYPE moneda_enum AS ENUM ('SOL', 'USD');
CREATE TYPE forma_pago_enum AS ENUM ('EFECTIVO', 'CHEQUE', 'TRANSFERENCIA');
CREATE TYPE tipo_cuenta_enum AS ENUM ('CORRIENTE', 'AHORROS');

-- Tabla principal de operaciones/recibos
CREATE TABLE operaciones (
    id SERIAL PRIMARY KEY,
    numero_operacion VARCHAR(20) NOT NULL UNIQUE,
    sucursal VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Información del cliente
    numero_cuenta VARCHAR(50) NOT NULL,
    nombre_cliente VARCHAR(200) NOT NULL,
    tipo_documento tipo_documento_enum NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    
    -- Detalles de la operación
    tipo_operacion tipo_operacion_enum NOT NULL,
    moneda moneda_enum NOT NULL,
    monto DECIMAL(12, 2) NOT NULL,
    
    -- Información adicional
    forma_pago forma_pago_enum NOT NULL,
    efectivo DECIMAL(12, 2) DEFAULT 0.00,
    monto_deposito DECIMAL(12, 2) DEFAULT 0.00,
    impuesto_retenido DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Observaciones
    observaciones TEXT
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_numero_operacion ON operaciones(numero_operacion);
CREATE INDEX idx_fecha ON operaciones(fecha);
CREATE INDEX idx_cliente ON operaciones(numero_documento);
CREATE INDEX idx_cuenta ON operaciones(numero_cuenta);

-- Tabla para el contador de operaciones
CREATE TABLE contador_operaciones (
    id SERIAL PRIMARY KEY,
    ultimo_numero INT NOT NULL DEFAULT 0,
    prefijo VARCHAR(10) NOT NULL DEFAULT '216',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar registro inicial del contador
INSERT INTO contador_operaciones (ultimo_numero, prefijo) VALUES (0, '216');

-- Tabla de sucursales (opcional, para normalizar)
CREATE TABLE sucursales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar sucursales comunes
INSERT INTO sucursales (nombre, telefono) VALUES 
('LIMA CENTRO', '216-045998'),
('MIRAFLORES', '216-045999'),
('SAN ISIDRO', '216-046000'),
('SURCO', '216-046001'),
('LA MOLINA', '216-046002');

-- Tabla de clientes (opcional, para normalizar)
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    tipo_documento tipo_documento_enum NOT NULL,
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para clientes
CREATE INDEX idx_documento ON clientes(numero_documento);
CREATE INDEX idx_nombre ON clientes(nombre_completo);

-- Tabla de cuentas bancarias (opcional, para normalizar)
CREATE TABLE cuentas_bancarias (
    id SERIAL PRIMARY KEY,
    numero_cuenta VARCHAR(50) NOT NULL UNIQUE,
    cliente_id INT REFERENCES clientes(id),
    tipo_cuenta tipo_cuenta_enum DEFAULT 'CORRIENTE',
    moneda moneda_enum DEFAULT 'SOL',
    saldo_actual DECIMAL(12, 2) DEFAULT 0.00,
    fecha_apertura DATE,
    activa BOOLEAN DEFAULT TRUE
);

-- Índices para cuentas bancarias
CREATE INDEX idx_numero_cuenta_bancaria ON cuentas_bancarias(numero_cuenta);
CREATE INDEX idx_cliente_cuenta ON cuentas_bancarias(cliente_id);

-- Vista para reportes completos
CREATE VIEW vista_operaciones_completas AS
SELECT 
    o.id,
    o.numero_operacion,
    o.sucursal,
    o.fecha,
    o.hora,
    o.fecha_creacion,
    o.numero_cuenta,
    o.nombre_cliente,
    o.tipo_documento,
    o.numero_documento,
    o.tipo_operacion,
    o.moneda,
    o.monto,
    o.forma_pago,
    o.efectivo,
    o.monto_deposito,
    o.impuesto_retenido,
    o.observaciones,
    CASE 
        WHEN o.moneda = 'SOL' THEN CONCAT('S/ ', TO_CHAR(o.monto, 'FM999,999,990.00'))
        ELSE CONCAT('US$ ', TO_CHAR(o.monto, 'FM999,999,990.00'))
    END as monto_formateado
FROM operaciones o
ORDER BY o.fecha_creacion DESC;

-- Función para generar próximo número de operación
CREATE OR REPLACE FUNCTION obtener_proximo_numero_operacion() 
RETURNS VARCHAR(20) AS $$
DECLARE
    nuevo_numero INT;
    prefijo VARCHAR(10);
    numero_formateado VARCHAR(20);
BEGIN
    -- Obtener y actualizar el contador
    UPDATE contador_operaciones 
    SET ultimo_numero = ultimo_numero + 1,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = 1
    RETURNING ultimo_numero, prefijo INTO nuevo_numero, prefijo;
    
    -- Formatear número con ceros a la izquierda
    numero_formateado := prefijo || '-' || LPAD(nuevo_numero::TEXT, 6, '0');
    
    RETURN numero_formateado;
END;
$$ LANGUAGE plpgsql;

-- Función para insertar nueva operación
CREATE OR REPLACE FUNCTION insertar_operacion(
    p_sucursal VARCHAR(100),
    p_numero_cuenta VARCHAR(50),
    p_nombre_cliente VARCHAR(200),
    p_tipo_documento VARCHAR(20),
    p_numero_documento VARCHAR(20),
    p_tipo_operacion VARCHAR(20),
    p_moneda VARCHAR(10),
    p_monto DECIMAL(12,2),
    p_forma_pago VARCHAR(20),
    p_efectivo DECIMAL(12,2),
    p_monto_deposito DECIMAL(12,2),
    p_impuesto_retenido DECIMAL(12,2),
    p_observaciones TEXT DEFAULT NULL
) RETURNS VARCHAR(20) AS $$
DECLARE
    nuevo_numero_op VARCHAR(20);
BEGIN
    -- Generar número de operación
    nuevo_numero_op := obtener_proximo_numero_operacion();
    
    -- Insertar operación
    INSERT INTO operaciones (
        numero_operacion, sucursal, fecha, hora,
        numero_cuenta, nombre_cliente, tipo_documento, numero_documento,
        tipo_operacion, moneda, monto, forma_pago,
        efectivo, monto_deposito, impuesto_retenido, observaciones
    ) VALUES (
        nuevo_numero_op, p_sucursal, CURRENT_DATE, CURRENT_TIME,
        p_numero_cuenta, p_nombre_cliente, p_tipo_documento::tipo_documento_enum, p_numero_documento,
        p_tipo_operacion::tipo_operacion_enum, p_moneda::moneda_enum, p_monto, p_forma_pago::forma_pago_enum,
        p_efectivo, p_monto_deposito, p_impuesto_retenido, p_observaciones
    );
    
    -- Retornar el número de operación generado
    RETURN nuevo_numero_op;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion en contador_operaciones
CREATE OR REPLACE FUNCTION actualizar_fecha_contador()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_contador
    BEFORE UPDATE ON contador_operaciones
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_contador();

-- Consultas útiles para reportes

-- 1. Operaciones del día
-- SELECT * FROM vista_operaciones_completas WHERE fecha = CURRENT_DATE;

-- 2. Total de operaciones por sucursal
-- SELECT sucursal, COUNT(*) as total_operaciones, SUM(monto) as monto_total
-- FROM operaciones 
-- GROUP BY sucursal;

-- 3. Operaciones por cliente
-- SELECT nombre_cliente, numero_documento, COUNT(*) as total_operaciones
-- FROM operaciones 
-- GROUP BY nombre_cliente, numero_documento
-- ORDER BY total_operaciones DESC;

-- 4. Resumen diario
-- SELECT 
--     fecha,
--     COUNT(*) as total_operaciones,
--     SUM(CASE WHEN moneda = 'SOL' THEN monto ELSE 0 END) as total_soles,
--     SUM(CASE WHEN moneda = 'USD' THEN monto ELSE 0 END) as total_dolares
-- FROM operaciones 
-- GROUP BY fecha 
-- ORDER BY fecha DESC;

-- Ejemplo de uso de la función:
-- SELECT insertar_operacion(
--     'LIMA CENTRO',
--     '200-3006659037-50',
--     'Juan Pérez García',
--     'DNI',
--     '12345678',
--     'DEPOSITO',
--     'SOL',
--     1500.00,
--     'EFECTIVO',
--     1500.00,
--     1500.00,
--     0.00,
--     'Depósito en efectivo'
-- );