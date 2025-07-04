# Design System - DebtManager

Este é o design system completo para a aplicação DebtManager, fornecendo componentes reutilizáveis, consistentes e acessíveis.

## 🎨 Componentes Disponíveis

### Button Component
Componente de botão versátil com múltiplas variantes e tamanhos.

```typescript
<app-button 
  variant="primary" 
  size="md" 
  [disabled]="false"
  [loading]="false"
  (clicked)="handleClick()">
  Clique aqui
</app-button>
```

**Variantes:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Tamanhos:** `xs`, `sm`, `md`, `lg`, `xl`

### Card Component
Container flexível para organizar conteúdo.

```typescript
<app-card variant="default" [hoverable]="true">
  <div slot="header">Título do Card</div>
  <p>Conteúdo do card...</p>
  <div slot="footer">Rodapé</div>
</app-card>
```

**Variantes:** `default`, `outlined`, `elevated`, `filled`

### Input Component
Campo de entrada com validação e estados visuais.

```typescript
<app-input
  type="text"
  label="Nome"
  placeholder="Digite seu nome"
  [required]="true"
  [disabled]="false"
  [(value)]="name"
  (valueChange)="onNameChange($event)">
</app-input>
```

**Tipos:** `text`, `email`, `password`, `number`, `tel`, `url`, `search`

### Icon Component
Ícones SVG otimizados com múltiplos tamanhos.

```typescript
<app-icon name="user" size="md"></app-icon>
```

**Tamanhos:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
**Ícones:** `user`, `settings`, `home`, `search`, `plus`, `minus`, `check`, `close`, etc.

### Modal Component
Modal acessível com múltiplos tamanhos e opções de configuração.

```typescript
<app-modal
  [isOpen]="showModal"
  title="Título do Modal"
  size="md"
  [showCloseButton]="true"
  (modalClose)="closeModal()">
  <p>Conteúdo do modal...</p>
  <div slot="footer">
    <app-button variant="outline" (clicked)="closeModal()">Cancelar</app-button>
    <app-button variant="primary" (clicked)="confirm()">Confirmar</app-button>
  </div>
</app-modal>
```

**Tamanhos:** `sm`, `md`, `lg`, `xl`, `full`

### Loading Component
Indicadores de carregamento com múltiplas variantes.

```typescript
<app-loading
  variant="spinner"
  size="md"
  [showText]="true"
  text="Carregando..."
  [overlay]="false">
</app-loading>
```

**Variantes:** `spinner`, `dots`, `pulse`, `bars`
**Tamanhos:** `xs`, `sm`, `md`, `lg`, `xl`

### Toast Component
Notificações temporárias com diferentes tipos e posições.

```typescript
// Usando o serviço
constructor(private toastService: ToastService) {}

showSuccess() {
  this.toastService.success('Operação realizada com sucesso!');
}

showError() {
  this.toastService.error('Erro ao processar solicitação');
}
```

**Tipos:** `success`, `error`, `warning`, `info`
**Posições:** `top-right`, `top-left`, `bottom-right`, `bottom-left`, `top-center`, `bottom-center`

### Toast Container
Container para exibir todas as notificações toast.

```typescript
// No app.component.html
<app-toast-container></app-toast-container>
```

## 🎯 Serviços

### ToastService
Serviço para gerenciar notificações toast globalmente.

```typescript
constructor(private toastService: ToastService) {}

// Métodos disponíveis
this.toastService.success('Mensagem de sucesso');
this.toastService.error('Mensagem de erro');
this.toastService.warning('Mensagem de aviso');
this.toastService.info('Mensagem informativa');

// Toast personalizado
this.toastService.show({
  type: 'success',
  title: 'Título',
  message: 'Mensagem',
  duration: 5000,
  persistent: false
});

// Toast de carregamento
const loadingId = this.toastService.loading('Processando...');
// Atualizar para sucesso
this.toastService.loadingSuccess(loadingId, 'Concluído!');
```

## 🎨 Design Tokens

O design system utiliza CSS custom properties para manter consistência:

### Cores
```scss
--color-primary: #2196f3;
--color-secondary: #9c27b0;
--color-success: #4caf50;
--color-error: #f44336;
--color-warning: #ff9800;
--color-info: #2196f3;
```

### Espaçamento
```scss
--spacing-1: 0.25rem; // 4px
--spacing-2: 0.5rem;  // 8px
--spacing-3: 0.75rem; // 12px
--spacing-4: 1rem;    // 16px
--spacing-6: 1.5rem;  // 24px
--spacing-8: 2rem;    // 32px
```

### Tipografia
```scss
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
```

### Bordas
```scss
--radius-sm: 0.25rem;
--radius-md: 0.375rem;
--radius-lg: 0.5rem;
--radius-xl: 0.75rem;
```

## ♿ Acessibilidade

Todos os componentes seguem as diretrizes WCAG 2.1 AA:

- **Navegação por teclado**: Todos os componentes são navegáveis via teclado
- **Screen readers**: Suporte completo para leitores de tela
- **Alto contraste**: Suporte para modo de alto contraste
- **Movimento reduzido**: Respeita preferências de movimento reduzido
- **Focus management**: Gerenciamento adequado de foco
- **ARIA labels**: Labels e roles ARIA apropriados

## 🎭 Animações

O sistema inclui animações suaves e performáticas:

- **Transições**: Duração e easing consistentes
- **Animações de entrada**: fadeIn, slideIn, scaleIn
- **Animações de saída**: fadeOut, slideOut, scaleOut
- **Hover effects**: Efeitos sutis de hover
- **Loading animations**: Spinners, dots, pulse, bars

## 📱 Responsividade

Todos os componentes são responsivos e se adaptam a diferentes tamanhos de tela:

- **Mobile first**: Design otimizado para dispositivos móveis
- **Breakpoints**: Pontos de quebra consistentes
- **Touch targets**: Alvos de toque adequados (44px mínimo)
- **Viewport adaptativo**: Componentes que se adaptam ao viewport

## 🚀 Como Usar

1. **Importe os componentes necessários:**
```typescript
import { ButtonComponent, CardComponent, ToastService } from '@shared/components';
```

2. **Adicione aos imports do seu módulo/componente:**
```typescript
@Component({
  imports: [ButtonComponent, CardComponent],
  // ...
})
```

3. **Use no template:**
```html
<app-button variant="primary" (clicked)="handleClick()">
  Clique aqui
</app-button>
```

## 🎯 Boas Práticas

1. **Consistência**: Use sempre os componentes do design system
2. **Acessibilidade**: Sempre forneça labels e descrições adequadas
3. **Performance**: Use trackBy functions em listas
4. **Responsividade**: Teste em diferentes tamanhos de tela
5. **Semântica**: Use elementos HTML semânticos apropriados

## 🔧 Customização

Para customizar o design system:

1. **Modifique as variáveis CSS** em `styles/tokens.scss`
2. **Estenda os componentes** criando variantes específicas
3. **Adicione novos ícones** no IconComponent
4. **Crie novos tipos de toast** no ToastService

## 📚 Exemplos Completos

Veja os exemplos de uso nos componentes da aplicação:
- `debt-title-form.component.ts` - Uso de formulários
- `debt-title-list.component.ts` - Uso de cards e botões
- `dashboard.component.ts` - Uso de loading e toasts