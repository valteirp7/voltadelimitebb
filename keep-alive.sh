#!/bin/bash

# Script de Monitoramento e Reinicialização Automática do Servidor
# Este script verifica se o servidor está rodando e o reinicia se necessário

LOG_FILE="/tmp/formulario-bb-monitor.log"
PID_FILE="/tmp/formulario-bb.pid"
SERVER_DIR="/home/ubuntu/formulario-bb"
PORT=3001

# Função para registrar logs
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Função para verificar se o servidor está rodando
is_server_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0  # Servidor está rodando
        fi
    fi
    
    # Verificar se há processo node rodando na porta 3001
    if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
        return 0  # Servidor está rodando
    fi
    
    return 1  # Servidor não está rodando
}

# Função para iniciar o servidor
start_server() {
    log_message "Iniciando servidor..."
    cd "$SERVER_DIR"
    NODE_ENV=production nohup node dist/index.js > /tmp/formulario-bb-server.log 2>&1 &
    local new_pid=$!
    echo "$new_pid" > "$PID_FILE"
    log_message "Servidor iniciado com PID: $new_pid"
    sleep 3
}

# Função para parar o servidor
stop_server() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            log_message "Parando servidor (PID: $pid)..."
            kill "$pid" 2>/dev/null
            sleep 2
            if ps -p "$pid" > /dev/null 2>&1; then
                kill -9 "$pid" 2>/dev/null
            fi
            log_message "Servidor parado"
        fi
    fi
}

# Função para verificar saúde do servidor
check_server_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null)
    if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
        return 0  # Servidor está saudável
    fi
    return 1  # Servidor não está respondendo
}

# Loop principal de monitoramento
log_message "Iniciando monitoramento do servidor..."

while true; do
    if ! is_server_running; then
        log_message "ALERTA: Servidor não está rodando! Reiniciando..."
        stop_server
        start_server
    elif ! check_server_health; then
        log_message "ALERTA: Servidor não está respondendo! Reiniciando..."
        stop_server
        start_server
    else
        log_message "Servidor está rodando normalmente"
    fi
    
    # Verificar a cada 30 segundos
    sleep 30
done
