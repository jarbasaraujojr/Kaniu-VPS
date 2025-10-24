# Kaniu - Sistema de Gestão de Abrigos de Animais

## Sobre o Projeto

Kaniu é um sistema completo para gestão de abrigos de animais, oferecendo funcionalidades para:
- Gestão de animais (cadastro, histórico, fotos)
- Controle de saúde (pesagens, vacinas, tratamentos)
- Processo de adoção
- Registro de animais perdidos/encontrados

## Estrutura do Projeto

```
/kaniu
├── /backend
│   ├── /supabase         # Configuração do Supabase
│   │   ├── schema.sql    # Schema do banco de dados
│   │   ├── functions/    # Edge Functions
│   │   └── policies/     # Políticas de segurança
│   └── /api
│       └── types/        # Tipos TypeScript
├── /frontend
│   ├── /assets          # Recursos estáticos
│   ├── /components      # Componentes reutilizáveis
│   ├── /pages           # Páginas principais
│   └── /utils           # Funções utilitárias
```

## Configuração do Ambiente

### Pré-requisitos
- Conta no Supabase
- Node.js instalado
- Git instalado

### Configuração do Supabase

1. Crie um novo projeto no Supabase
2. Execute o arquivo `schema.sql` no SQL Editor
3. Configure as políticas de segurança do arquivo `policies/security_policies.sql`
4. Configure as variáveis de ambiente

### Configuração do Frontend

1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Funcionalidades Principais

### Gestão de Animais
- Cadastro completo com fotos
- Histórico médico
- Características físicas
- Status (disponível, adotado, etc.)

### Controle de Saúde
- Registro de peso
- Vacinas e vermífugos
- Tratamentos médicos
- Avaliações comportamentais

### Adoções
- Processo de solicitação
- Aprovação/rejeição
- Acompanhamento

### Animais Perdidos/Encontrados
- Registro com localização
- Sistema de matching
- Notificações

## Segurança

O sistema utiliza:
- Autenticação via Supabase Auth
- Row Level Security (RLS)
- Políticas de acesso granular
- Auditoria completa de ações

## Contribuição

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.