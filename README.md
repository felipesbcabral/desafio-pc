# 💰 DebtManager Challenge

> API RESTful para gestão de títulos de dívida desenvolvida em .NET 8

## 📋 Sobre o Projeto

O **DebtManager Challenge** é uma API para gestão de títulos de dívida que permite criar, consultar e calcular valores atualizados de dívidas com base em taxas de juros diárias. O projeto foi desenvolvido seguindo uma arquitetura pragmática que equilibra simplicidade, velocidade de desenvolvimento e boas práticas de design.

## 🚀 Tecnologias Utilizadas

- **.NET 9** - Framework principal
- **ASP.NET Core Web API** - Framework da API
- **Entity Framework Core** - ORM para acesso a dados
- **SQL Server** - Banco de dados
- **AutoMapper** - Mapeamento objeto-objeto
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 🏗️ Arquitetura

O projeto segue uma arquitetura de 2 camadas principais:

### DebtManager.Core
- **Domain**: Entidades, Value Objects e Interfaces
- **Application**: Serviços e Casos de Uso
- **Infrastructure**: Repositórios e Acesso a Dados

### DebtManager.Api
- **Controllers**: Endpoints da API
- **DTOs**: Objetos de Transferência de Dados
- **Configuration**: Configurações e Injeção de Dependência

## 📊 Funcionalidades

- ✅ Criar títulos de dívida
- ✅ Listar todos os títulos
- ✅ Buscar título específico
- ✅ Calcular valor atualizado com juros
- ✅ Gerenciar parcelas
- ✅ Validação de documentos (CPF/CNPJ)

## 🔧 Como Executar

### Pré-requisitos
- .NET 9 SDK
- Docker e Docker Compose
- SQL Server (ou usar container)

### Executando com Docker

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/DebtManager-Challenge.git
cd DebtManager-Challenge

# Execute com Docker Compose
docker-compose up -d
```

### Executando Localmente

```bash
# Restaurar dependências
dotnet restore

# Executar migrations
dotnet ef database update --project src/DebtManager.Core --startup-project src/DebtManager.Api

# Executar a aplicação
dotnet run --project src/DebtManager.Api
```

## 🧮 Cálculo de Juros

O valor atualizado é calculado usando a fórmula:

```
Valor Atualizado = Valor Original + (Valor Original × Taxa de Juros Diária × Dias em Atraso)
```

- Se a data de vencimento ainda não passou, o valor atualizado é igual ao valor original
- A taxa de juros é aplicada apenas sobre dias em atraso

## 📁 Estrutura do Projeto

```
DebtManager-Challenge/
├── src/
│   ├── DebtManager.Core/
│   │   ├── Domain/
│   │   │   ├── Entities/
│   │   │   ├── ValueObjects/
│   │   │   └── Repositories/
│   │   ├── Application/
│   │   │   ├── Services/
│   │   │   └── Mappings/
│   │   └── Infrastructure/
│   │       └── Persistence/
│   └── DebtManager.Api/
│       ├── Controllers/
│       ├── DTOs/
│       └── Program.cs
├── tests/ (futuro)
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## 👨‍💻 Autor

**Felipe** - Desenvolvedor

---