# 💰 DebtManager Challenge

> Sistema completo para gestão de títulos de dívida com backend .NET 8 e frontend Angular 20

## 📋 Sobre o Projeto

O **DebtManager Challenge** é um sistema completo para gestão de títulos de dívida que permite criar, consultar, editar e calcular valores atualizados de dívidas com base em taxas de juros e multas. O projeto foi desenvolvido seguindo Clean Architecture no backend e padrões modernos do Angular no frontend.

### ✨ Principais Funcionalidades

- 📊 **Dashboard** com métricas e gráficos
- 💳 **Gestão de Títulos de Dívida** (CRUD completo)
- 📅 **Controle de Parcelas** com status de pagamento
- 🧮 **Cálculo Automático** de juros e multas
- 📋 **Validação de Documentos** (CPF/CNPJ)
- 🔍 **Busca e Filtros** avançados
- 📱 **Interface Responsiva** com Tailwind CSS

## 🚀 Stack Tecnológica

### Backend (.NET)
- **.NET 8** - Framework principal
- **ASP.NET Core Web API** - Framework da API
- **Entity Framework Core** - ORM para acesso a dados
- **SQL Server** - Banco de dados
- **FluentValidation** - Validação de dados
- **xUnit** - Testes unitários
- **Docker** - Containerização

### Frontend (Angular)
- **Angular 20** - Framework frontend
- **TypeScript** - Linguagem principal
- **Tailwind CSS** - Framework CSS
- **Angular Material** - Componentes UI
- **NgRx** - Gerenciamento de estado
- **Chart.js** - Gráficos e visualizações
- **Lucide Icons** - Ícones modernos

## 🏗️ Arquitetura

### Backend - Clean Architecture

O backend segue os princípios da Clean Architecture com separação clara de responsabilidades:

#### **DebtManager.Core**
- **Domain**: Entidades (`DebtTitle`, `Installment`), Value Objects (`Document`, `Debtor`) e Interfaces
- **Application**: Serviços de aplicação, DTOs e casos de uso
- **Infrastructure**: Repositórios, Entity Framework e acesso a dados

#### **DebtManager.Api**
- **Controllers**: Endpoints RESTful
- **DTOs**: Objetos de transferência de dados
- **Validators**: Validações com FluentValidation
- **Services**: Mapeamento e configurações

### Frontend - Feature-Based Architecture

O frontend Angular segue uma arquitetura baseada em features:

#### **Core Module**
- **Models**: Interfaces TypeScript
- **Services**: Comunicação com API
- **Guards**: Proteção de rotas
- **Interceptors**: Tratamento de erros HTTP

#### **Features Module**
- **debt-management**: Módulo principal com páginas e componentes
- **shared**: Componentes reutilizáveis (pascho-button, pascho-input, etc.)
- **layouts**: Layout principal da aplicação

## 🔧 Como Executar

### Pré-requisitos
- **.NET 8 SDK** ou superior
- **Node.js 18+** e npm
- **Docker e Docker Compose**
- **SQL Server** (ou usar container)

### 🐳 Executando com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/felipesbcabral/desafio-pc.git
cd desafio-pc

# Execute com Docker Compose
docker-compose up -d
```

**URLs de Acesso:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000
- Swagger: http://localhost:5000/swagger

### 💻 Executando Localmente

#### Backend
```bash
cd backend

# Restaurar dependências
dotnet restore

# Executar migrations
dotnet ef database update --project DebtManager.Core --startup-project DebtManager.Api

# Executar a aplicação
dotnet run --project DebtManager.Api
```

#### Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start
```

### 🧪 Executando Testes

```bash
# Testes do Backend
cd backend
dotnet test
```

## 🧮 Cálculo de Juros e Multas

O sistema calcula automaticamente valores atualizados considerando:

### Fórmula de Cálculo
```
Valor Atualizado = Valor Original + Juros + Multa

Juros = Valor Original × Taxa de Juros × Dias em Atraso
Multa = Valor Original × Taxa de Multa (aplicada uma vez)
```

### Regras de Negócio
- ✅ Juros aplicados diariamente sobre o valor original
- ✅ Multa aplicada uma única vez quando há atraso
- ✅ Se não há atraso, valor atualizado = valor original
- ✅ Cálculo automático baseado na data atual vs. vencimento

## 🔗 API Endpoints

### Títulos de Dívida
```http
GET    /api/debts              # Listar todos os títulos
GET    /api/debts/{id}         # Buscar título específico
POST   /api/debts              # Criar novo título
PUT    /api/debts/{id}         # Atualizar título
DELETE /api/debts/{id}         # Excluir título
```

**Documentação completa:** http://localhost:5000/swagger

## 📁 Estrutura do Projeto

```
desafio-pc/
├── backend/
│   ├── DebtManager.Api/           # Camada de apresentação
│   │   ├── Controllers/           # Endpoints da API
│   │   ├── DTOs/                  # Objetos de transferência
│   │   ├── Validators/            # Validações FluentValidation
│   │   └── Services/              # Serviços de mapeamento
│   ├── DebtManager.Core/          # Camada de domínio e aplicação
│   │   ├── Domain/
│   │   │   ├── Entities/          # DebtTitle, Installment
│   │   │   ├── ValueObjects/      # Document, Debtor
│   │   │   └── Repositories/      # Interfaces
│   │   ├── Application/           # Serviços de aplicação
│   │   └── Infrastructure/        # Entity Framework, Repositórios
│   ├── DebtManager.Tests/         # Testes unitários
│   └── DebtManager.IntegrationTests/ # Testes de integração
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/              # Serviços, modelos, guards
│       │   ├── features/          # Módulos de funcionalidades
│       │   │   └── debt-management/
│       │   │       ├── pages/     # Dashboard, CRUD, Parcelas
│       │   │       └── components/
│       │   ├── shared/            # Componentes reutilizáveis
│       │   └── layouts/           # Layout principal
│       └── environments/          # Configurações de ambiente
├── docker-compose.yml
└── README.md
```

## 👨‍💻 Autor

**Felipe Cabral**
- GitHub: [@felipesbcabral](https://github.com/felipesbcabral)
- LinkedIn: [Felipe Cabral](https://linkedin.com/in/felipesbcabral)

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!**
