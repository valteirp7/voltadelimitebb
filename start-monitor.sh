#!/bin/bash

# Script para iniciar o monitoramento do servidor automaticamente
# Este script deve ser executado uma vez para configurar o monitoramento permanente

echo "Configurando inicialização automática do Formulário BB..."

# Criar arquivo de inicialização no cron
CRON_JOB="@reboot cd /home/ubuntu/formulario-bb && nohup ./keep-alive.sh > /tmp/keep-alive.log 2>&1 &"

# Verificar se o cron job já existe
if crontab -l 2>/dev/null | grep -q "keep-alive.sh"; then
    echo "✓ Cron job já está configurado"
else
    # Adicionar o cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✓ Cron job adicionado com sucesso"
fi

# Iniciar o monitoramento imediatamente se não estiver rodando
if ! pgrep -f "keep-alive.sh" > /dev/null; then
    echo "Iniciando monitoramento..."
    cd /home/ubuntu/formulario-bb
    nohup ./keep-alive.sh > /tmp/keep-alive.log 2>&1 &
    echo "✓ Monitoramento iniciado"
else
    echo "✓ Monitoramento já está rodando"
fi

echo ""
echo "Configuração concluída!"
echo "Seu servidor agora vai:"
echo "  - Iniciar automaticamente ao reiniciar o sistema"
echo "  - Monitorar a saúde do servidor a cada 30 segundos"
echo "  - Reiniciar automaticamente se cair"
echo ""
echo "Para verificar o status, execute:"
echo "  tail -f /tmp/formulario-bb-monitor.log"
