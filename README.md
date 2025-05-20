# Load Board Automation System

Este projeto implementa um sistema de automação para extração e análise de dados de cargas usando Puppeteer, NestJS e GPT Compute Preview.

## Arquitetura

O sistema consiste em dois microserviços principais:

1. **automation-service**: Extrai dados de load boards usando Puppeteer e envia para processamento
2. **gpt-service**: Processa os dados extraídos usando IA via GPT Compute Preview

Além disso, o projeto inclui:

- Banco de dados PostgreSQL para armazenamento de dados
- Prometheus para monitoramento e métricas
- Docker e Docker Compose para containerização e orquestração
- Testes automatizados com Jest

## Tecnologias Utilizadas

- **Backend**: TypeScript, Node.js, NestJS
- **Banco de Dados**: PostgreSQL, TypeORM
- **Automação**: Puppeteer
- **IA**: OpenAI SDK v4, GPT Compute Preview
- **Containerização**: Docker, Docker Compose, Alpine Linux
- **Testes**: Jest, Supertest
- **Monitoramento**: Prometheus, prom-client
- **CI/CD**: GitHub Actions (opcional)

## Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (apenas para desenvolvimento local)
- Uma chave de API da OpenAI

## Configuração de Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```
# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

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

### Estrutura do Projeto

```
/
├── automation-service/          # Serviço de extração de dados
│   ├── src/                     # Código-fonte
│   ├── test/                    # Testes automatizados
│   └── Dockerfile               # Configuração do container
├── gpt-service/                 # Serviço de processamento IA
│   ├── src/                     # Código-fonte
│   ├── test/                    # Testes automatizados
│   └── Dockerfile               # Configuração do container
├── db-scripts/                  # Scripts SQL para o banco
│   └── init.sql                 # Inicialização do banco
├── prometheus/                  # Configuração do Prometheus
│   └── prometheus.yml           # Configuração de scraping
├── docker-compose.yml           # Orquestração de containers
├── .env                         # Variáveis de ambiente
└── README.md                    # Documentação
```

## Instalação e Execução

### Via Docker Compose (Recomendado)

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/loadboard-automation.git
cd loadboard-automation
```

2. Configure o arquivo `.env` com sua chave API da OpenAI

3. Inicie os serviços:
```bash
docker-compose up -d
```

4. Verifique se os serviços estão rodando:
```bash
docker-compose ps
```

### Desenvolvimento Local

1. Inicie apenas o banco de dados:
```bash
docker-compose up -d postgres
```

2. Instale as dependências e inicie cada serviço:

```bash
# Para o automation-service
cd automation-service
npm install
npm run start:dev

# Para o gpt-service (em outro terminal)
cd gpt-service
npm install
npm run start:dev
```

## Endpoints Disponíveis

### Automation Service (porta 3000)

- `GET /scraper/jbhunt`: Extrai cargas apenas do JB Hunt
- `GET /scraper/landstar`: Extrai cargas apenas do Landstar
- `POST /scraper/run`: Execução completa de extração e processamento
- `GET /metrics`: Métricas Prometheus

### GPT Service (porta 3001)

- `POST /summarize-loads`: Processa cargas com GPT e retorna insights
- `GET /metrics`: Métricas Prometheus

### Documentação Swagger

- Automation Service: `http://localhost:3000/api`
- GPT Service: `http://localhost:3001/api`

## Monitoramento

O Prometheus está configurado e pode ser acessado em `http://localhost:9090`. Caso tenha problemas com a conexão entre o Prometheus e os serviços, verifique:

1. Os nomes dos hosts na configuração do Prometheus
2. A configuração de rede no Docker Compose

Solução para problemas comuns:

```yaml
# No arquivo prometheus/prometheus.yml, atualize para:
scrape_configs:
  - job_name: 'automation-service'
    metrics_path: /metrics
    static_configs:
      - targets: ['host.docker.internal:3000']  # Para testes locais

  - job_name: 'gpt-service'
    metrics_path: /metrics
    static_configs:
      - targets: ['host.docker.internal:3001']  # Para testes locais
```

## Banco de Dados

### Modelo de Dados
- **drivers**: Informações de motoristas
- **loads**: Dados de cargas extraídos
- **summaries**: Análises geradas pela IA

### Consultas Úteis

```sql
-- Ver cargas extraídas
SELECT * FROM loads LIMIT 10;

-- Ver sumários gerados pela IA
SELECT * FROM summaries LIMIT 10;

-- Ver a view materializada
SELECT * FROM load_summaries LIMIT 10;

-- Top 5 cargas com insights
SELECT * FROM get_top_loads_with_insights();
```

## Testes

Para executar testes unitários:

```bash
# No automation-service
npm test

# No gpt-service
npm test
```

Para testes end-to-end:

```bash
# No automation-service
npm run test:e2e

# No gpt-service
npm run test:e2e
```

## Exemplos de Uso

### PowerShell

```powershell
# Extrair dados de JB Hunt
Invoke-WebRequest -Uri "http://localhost:3000/scraper/jbhunt" -Method Get

# Processar dados com GPT
$body = @{
  loads = @(
    @{
      id = 1
      origin = "Chicago, IL"
      destination = "Dallas, TX"
      price = 1850.50
      eta = "2023-06-01T14:30:00.000Z"
      source = "jbhunt"
    }
  )
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/summarize-loads" -Method Post -Body $body -ContentType "application/json"
```

### Curl

```bash
# Extrair dados de JB Hunt
curl http://localhost:3000/scraper/jbhunt

# Processar dados com GPT
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

## Resolução de Problemas

### Containers não iniciam
Verifique logs com `docker-compose logs [service-name]`

### Problemas de conexão com o banco
```bash
docker-compose exec postgres psql -U postgres -d loadboard -c "SELECT 1;"
```

### Problemas com Puppeteer
Verifique se as dependências do Chrome estão instaladas no container.

## Post-Mortem: Desafios e Decisões Arquiteturais

O desenvolvimento deste sistema de automação para load boards apresentou desafios significativos, principalmente na integração entre extração de dados, processamento com IA e persistência em banco relacional.

A decisão por uma arquitetura de microserviços baseada em NestJS permitiu separar claramente as responsabilidades: o automation-service focado na extração via Puppeteer, e o gpt-service na análise com IA. Esta separação proporciona escalabilidade independente e melhor isolamento de falhas.

O maior desafio técnico foi a configuração do Puppeteer em ambiente containerizado, exigindo instalação específica de dependências no Alpine Linux. Implementamos estratégias de retry/backoff para lidar com falhas intermitentes em sites externos.

Na integração com OpenAI, investimos em prompts cuidadosamente estruturados para obter respostas consistentes e acionáveis sobre tendências de preços e oportunidades de otimização de rotas. O desafio foi balancear o uso de tokens com a qualidade das análises.

O monitoramento com Prometheus foi implementado em todos os componentes, permitindo visibilidade em tempo real do sistema, fundamental para operações em produção.

Como próximos passos, planejamos:
1. Expandir para outros load boards e fontes de dados
2. Implementar aprendizado contínuo baseado nos resultados anteriores
3. Desenvolver um frontend para visualização de tendências
4. Melhorar a resiliência com circuit breakers e health checks avançados

## Licença

MIT