# billorteste# Load Board Automation System

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

## Configuração

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/loadboard-automation.git
cd loadboard-automation
```

2. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
OPENAI_API_KEY=sua-chave-api-openai
```

## Execução

Para iniciar todos os serviços:

```bash
docker-compose up -d
```

Para verificar o status dos serviços:

```bash
docker-compose ps
```

## Endpoints Disponíveis

### Automation Service (porta 3000)

- `GET /scraper/jbhunt`: Extrai cargas apenas do JB Hunt
- `GET /scraper/landstar`: Extrai cargas apenas do Landstar
- `POST /scraper/run`: Executa completa de extração e processamento
- `GET /metrics`: Métricas Prometheus

### GPT Service (porta 3001)

- `POST /summarize-loads`: Processa cargas com GPT e retorna insights
- `GET /metrics`: Métricas Prometheus

## Monitoramento

O Prometheus está configurado na porta 9090. Para acessar o dashboard, abra:

```
http://localhost:9090
```

## Testes

Para executar os testes em cada serviço:

```bash
# Automation Service
cd automation-service
npm test

# GPT Service
cd gpt-service
npm test
```

## Exemplos de Uso

### Extrair dados de JB Hunt

```bash
curl http://localhost:3000/scraper/jbhunt
```

### Processar dados com GPT

```bash
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

## Post-Mortem: Desafios e Decisões

O desenvolvimento deste projeto de automação e análise de cargas trouxe diversos desafios técnicos e arquiteturais. A principal dificuldade foi a integração entre os diferentes componentes: extração de dados via web scraping, processamento com IA, e persistência em banco de dados.

Optamos por uma arquitetura de microserviços para garantir separação de responsabilidades, escalabilidade independente e melhor resiliência. O Docker Compose se mostrou fundamental para gerenciar esta complexidade, permitindo integração e testes em ambiente isolado.

Na automação web, o Puppeteer demonstrou capacidade robusta para interagir com portais de carga, embora tenha exigido tratamentos específicos para execução em containers (Chrome Headless no Alpine). Implementamos mecanismos de retry e backoff para lidar com falhas intermitentes.

A integração com GPT Compute Preview trouxe valiosos insights dos dados, transformando informações cruas em análises acionáveis sobre tendências de preços e otimização de rotas. O desafio foi otimizar prompts para obter respostas estruturadas e consistentes.

Como próximos passos, pretendemos:
1. Expandir para mais fontes de dados de carga
2. Implementar aprendizado contínuo baseado nas análises anteriores
3. Desenvolver um frontend para visualização das tendências identificadas
4. Aprofundar a análise com modelos específicos treinados no domínio logístico

## Licença

MIT