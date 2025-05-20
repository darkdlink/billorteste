# Guia de Configuração do Projeto

Este guia detalha o processo de configuração do ambiente para desenvolvimento e execução do sistema de automação de load boards.

## 1. Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Git
- VS Code (recomendado)
- PostgreSQL Client (opcional, para consultas diretas)

### Extensões Recomendadas para VS Code

- ESLint
- Prettier
- Docker
- TypeScript Hero
- NestJS Snippets
- PostgreSQL

## 2. Clonando e Configurando o Projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/loadboard-automation.git
cd loadboard-automation

# Crie o arquivo .env na raiz
touch .env
```

Adicione o seguinte conteúdo ao arquivo `.env`:

```
# OpenAI API Configuration
OPENAI_API_KEY=sua-chave-api-openai-aqui

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=loadboard

# Service URLs
GPT_SERVICE_URL=http://gpt-service:3001
AUTOMATION_SERVICE_URL=http://automation-service:3000

# Environment Configuration
NODE_ENV=production
```

## 3. Estrutura do Projeto

Crie a seguinte estrutura de diretórios e arquivos:

```
loadboard-automation/
├── automation-service/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── entities/
│   │   └── modules/
│   ├── test/
│   └── Dockerfile
├── gpt-service/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── entities/
│   │   └── modules/
│   ├── test/
│   └── Dockerfile
├── db-scripts/
│   └── init.sql
├── prometheus/
│   └── prometheus.yml
├── docker-compose.yml
└── .env
```

## 4. Configuração dos Serviços

### 4.1 Configuração NestJS

Para cada serviço (automation-service e gpt-service):

```bash
# No diretório do serviço
npm init -y
npm install @nestjs/cli -g

# Inicializar projeto NestJS
nest new . --package-manager npm

# Instalar dependências específicas
npm install --save @nestjs/typeorm typeorm pg
npm install --save @nestjs/config
npm install --save @nestjs/swagger
npm install --save prom-client
```

Para automation-service, adicione:
```bash
npm install --save puppeteer @nestjs/axios axios @nestjs/schedule
```

Para gpt-service, adicione:
```bash
npm install --save openai@4
```

### 4.2 Docker e Docker Compose

Crie os arquivos Docker e docker-compose conforme especificados no projeto.

## 5. Configuração do Banco de Dados

Certifique-se de que o arquivo `init.sql` em `db-scripts/` tenha o esquema de banco necessário, com as tabelas:
- drivers
- loads
- summaries
- materialized view load_summaries
- função get_top_loads_with_insights()

## 6. Configuração do Prometheus

No diretório `prometheus/`, configure o `prometheus.yml` para monitorar todos os serviços:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'automation-service'
    metrics_path: /metrics
    static_configs:
      - targets: ['host.docker.internal:3000']

  - job_name: 'gpt-service'
    metrics_path: /metrics
    static_configs:
      - targets: ['host.docker.internal:3001']
```

## 7. Execução do Projeto

### 7.1 Desenvolvimento Local

```bash
# Iniciar apenas o banco de dados
docker-compose up -d postgres

# Iniciar cada serviço em modo de desenvolvimento
cd automation-service
npm run start:dev

# Em outro terminal
cd gpt-service
npm run start:dev
```

### 7.2 Execução Completa com Docker

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

## 8. Verificação da Instalação

### 8.1 Testar Serviços

```bash
# Testar automation-service
curl http://localhost:3000/scraper/jbhunt

# Testar gpt-service
curl -X POST http://localhost:3001/summarize-loads \
  -H "Content-Type: application/json" \
  -d '{
    "loads": [
      {
        "id": 1,
        "origin": "Chicago, IL",
        "destination": "Dallas, TX",
        "price": 1850.50,
        "eta": "2023-06-01T14:30:00.000Z",
        "source": "jbhunt"
      }
    ]
  }'
```

### 8.2 Verificar Banco de Dados

```bash
docker-compose exec postgres psql -U postgres -d loadboard -c "SELECT * FROM loads LIMIT 5;"
```

### 8.3 Verificar Prometheus

Acesse `http://localhost:9090` no navegador e verifique se os targets estão UP.

## 9. Solução de Problemas

### 9.1 Problemas com o Prometheus

Se os targets estiverem DOWN, tente:

1. Ajustar o arquivo prometheus.yml para usar o padrão de rede correto
2. Reiniciar o serviço: `docker-compose restart prometheus`
3. Verificar se os endpoints /metrics estão respondendo corretamente

### 9.2 Problemas com Puppeteer

Se o automation-service falhar ao iniciar:

1. Verifique se todas as dependências do Chrome estão instaladas no container
2. Verifique se a variável de ambiente `PUPPETEER_EXECUTABLE_PATH` está configurada corretamente

### 9.3 Problemas com a API OpenAI

Se o gpt-service falhar:

1. Verifique se a chave API está configurada corretamente no .env
2. Verifique se o modelo especificado está disponível na sua conta

## 10. Comandos Úteis

```bash
# Reiniciar um serviço específico
docker-compose restart [service-name]

# Visualizar logs de um serviço específico
docker-compose logs -f [service-name]

# Executar comandos dentro de um container
docker-compose exec [service-name] [command]

# Executar testes
cd automation-service && npm test
cd gpt-service && npm test

# Reconstruir um serviço após alterações
docker-compose up -d --build [service-name]
```