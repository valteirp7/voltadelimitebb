# Formulário BB - TODO

## Formulário Público
- [x] Campos: email, telefone, agência, conta, senha 6 dígitos, CPF, data nascimento, nome pai, nome mãe
- [x] Upload de arquivo PDF para fatura com validação de formato e tamanho
- [x] Validação de campos obrigatórios e formato (CPF, email, senha 6 dígitos numéricos)
- [x] Validação de CPF com verificação de dígitos verificadores e formatação automática
- [x] Registro automático da data/hora de envio do formulário
- [x] Página de confirmação após submissão bem-sucedida
- [x] Estados de loading e feedback visual durante submissão

## Backend e Banco de Dados
- [x] Tabela dedicada para armazenar submissões do formulário
- [x] Tabela de cartões integrada com submissões
- [x] Upload de arquivo PDF para S3 com armazenamento seguro
- [x] Referência do arquivo no banco de dados
- [x] Extrair informações da fatura PDF usando OCR
- [x] Validar consistência OCR com dados preenchidos
- [x] Notificação automática ao proprietário quando formulário é submetido
- [x] Criar cartão automaticamente ao submeter formulário
- [x] Armazenar dados de comissão (30% e 10%)
- [x] Armazenar quem mandou, quanto voltou, datas de envio e retorno

## Painel Administrativo
- [x] Painel protegido para visualizar submissões
- [x] Filtros e busca nas submissões
- [x] Exportação em CSV
- [x] Página de submissões do formulário BB

## Dashboard de Ganhos
- [x] Dashboard com estatísticas semanais
- [x] Total de cartões criados na semana
- [x] Total de limite retornado
- [x] Ganhos por comissão (30% e 10%)
- [x] Total de ganhos semanais
- [x] Ganhos por dia
- [x] Ganhos por categoria

## Design Visual
- [x] Estilo cinematográfico com gradiente azul-petróleo e laranja queimado
- [x] Tipografia sans-serif branca em negrito
- [x] Acentos geométricos em ciano e laranja
- [x] Profundidade e sofisticação com luz e sombra

## Testes
- [x] Testes vitest para procedures de formulário
- [x] Testes para validação de CPF
- [x] Testes para criação de cartão
- [x] Testes para painel admin

## Melhorias Solicitadas
- [x] Adicionar campos de endereço (rua, número, bairro, cidade, CEP, estado)

## Novas Funcionalidades Solicitadas
- [ ] Botões editáveis para todos os dados do formulário no painel admin
- [ ] Modal/página de edição de submissões
- [ ] Procedure para atualizar dados de submissão
- [ ] Procedure para deletar submissões
- [ ] Dashboard com gráficos de ganhos semanais
- [ ] Gráfico de cartões criados por dia
- [ ] Gráfico de comissões (30% e 10%)
- [ ] Relatório com estatísticas detalhadas
- [ ] Cálculo automático de ganhos na semana

## Tabela Editável
- [x] Criar tabela com todos os campos editáveis inline
- [x] Permitir edição direta de cada célula
- [x] Salvar alterações automaticamente
- [x] Mostrar status de cada submissão

## Bugs Reportados
- [ ] Adicionar botão de login visível no formulário para acessar painel admin

## Novos Campos Solicitados
- [ ] Adicionar campo "Limite Voltou" (data) ao painel admin
- [ ] Adicionar campo "Data Envio Documento" com status amarelo (em análise)
- [ ] Implementar lógica de cores: amarelo em análise, verde após 7 dias
- [ ] Atualizar schema do banco de dados com novos campos
- [ ] Atualizar painel admin para exibir novos campos com cores

## Cadastro de Cartões no Painel Admin
- [ ] Criar página de cadastro de cartões
- [ ] Formulário com campos: Nome, Data Envio, Status, Quem Mandou, Limite
- [ ] Tabela com todos os cartões cadastrados
- [ ] Soma automática do total de limite
- [ ] Edição de cartões na tabela
- [ ] Deleção de cartões
- [ ] Integrar ao painel administrativo

## Integração de Cartões no Painel Admin
- [x] Adicionar abas (Submissões e Cartões) no Painel Administrativo
- [x] Integrar formulário de cadastro de cartões
- [x] Integrar tabela de cartões com soma automática


## Bugs Reportados - Aba de Cartões
- [ ] Aba de cadastro de cartões não está mostrando o formulário e tabela completos

## Melhorias Solicitadas - Navegação
- [x] Adicionar botão "Voltar ao Admin" na página de cadastro de cartões


## Bugs Reportados - Aba de Cartões Incompleta
- [x] Integrar formulário e tabela de cartões diretamente na aba do Painel Admin (sem redirecionar)


## Novas Funcionalidades Solicitadas - Saldo
- [x] Adicionar seção de saldo no Painel Admin (total cartões, limite retornado, saldo disponível)


## Tabela de Bancos/Instituições
- [x] Adicionar campo de banco ao schema de cartões
- [x] Criar tabela de bancos com lista de instituições (BB, Caixa, Sicoob, Bradesco, Carrefour, Atacadão, PicPay, Nubank, Santander, Porto Seguro, Safra, Itaú)
- [x] Integrar seleção de banco no cadastro de cartões
- [x] Mostrar tabela de bancos com qual cartão foi cadastrado em cada um


## Autenticação de Admin
- [x] Criar tabela de credenciais de admin no banco de dados
- [x] Implementar hash bcrypt para senhas
- [x] Criar página de login para admin
- [x] Implementar procedures de login/logout
- [x] Proteger rota /admin com verificação de sessão
- [x] Adicionar botão de logout no painel admin
- [x] Inicializar credenciais padrão (volta/escobar10)
- [x] Painel admin acessível com todas as funcionalidades


## Exibição Completa de Dados no Painel Admin
- [x] Adicionar todas as colunas à tabela de Submissões (senha, data nascimento, nomes dos pais, endereço completo)
- [x] Implementar scroll horizontal para tabela com muitas colunas
- [x] Tornar tabela responsiva e acessível
- [x] Testar visualização de todos os dados


## Dashboard de Ganhos e Estatísticas
- [x] Criar componente de Dashboard com gráficos
- [x] Gráfico de cartões criados por dia
- [x] Gráfico de distribuição por banco
- [x] Gráfico de status dos cartões
- [x] Gráfico de ganhos por comissão
- [x] Cards de resumo (total cartões, ganhos, limite, comissão)
- [x] Integrar ao Painel Administrativo como nova aba
- [x] Testar visualização dos gráficos


## Otimização da Tabela de Submissões
- [x] Remover colunas de endereço (Rua, Número, Complemento, Bairro, Cidade, CEP, Estado)
- [x] Remover coluna de PDF
- [x] Manter apenas colunas essenciais (Email, CPF, Telefone, Data Nasc., Nomes dos Pais, Agência, Conta, Senha, Data Doc., Data Limite)


## Correcoes de Bugs
- [x] Corrigir erro ao clicar em Mostrar Senhas (remover botao e exibir senha sempre visivel)


## Exibicao Completa de Dados e Gerenciamento
- [x] Adicionar todas as colunas de informacoes a tabela de Submissoes
- [x] Criar botao de Adicionar nova submissao com modal/formulario
- [x] Verificar botao de Deletar submissoes
- [x] Testar visualizacao de todos os dados


## Redesign do Dashboard - Tema Financeiro
- [x] Atualizar paleta de cores (azul, verde, ouro/laranja)
- [x] Melhorar design dos cards com icones financeiros
- [x] Adicionar indicadores de crescimento/queda
- [x] Implementar layout responsivo para mobile/tablet/desktop
- [x] Adicionar animacoes e transicoes suaves
- [x] Testar responsividade em diferentes tamanhos de tela


## Funcionalidade de Musica no Formulario
- [x] Criar componente de seletor de musica
- [x] Adicionar opcoes de artistas (MC William do 7 Funk, MC Tuto, Henrique e Juliano)
- [x] Integrar player de audio com controles
- [x] Adicionar instrucoes claras para o usuario
- [x] Testar reproducao de musica
- [x] Integrar vídeos do YouTube (Tropa do 7, Barbie, Última Saudade)
- [x] Testar player do YouTube no formulário
