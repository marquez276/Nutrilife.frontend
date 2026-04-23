# API - json-server

Base URL: `http://localhost:3001`

## Como rodar

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - API
npm run server
```

## Endpoints disponíveis

| Recurso         | URL                          |
|-----------------|------------------------------|
| Usuários        | GET /usuarios                |
| Anamnese        | GET /anamnese                |
| Refeições       | GET /refeicoes               |
| Pesagens        | GET /pesagens                |
| Plano Alimentar | GET /planoAlimentar          |
| Alimentos       | GET /alimentos               |
| Nutricionistas  | GET /nutricionistas          |
| Consultas       | GET /consultas               |
| Agenda          | GET /agenda                  |
| Pacientes       | GET /pacientes               |
| Usuários Admin  | GET /usuariosAdmin           |
| Logs            | GET /logs                    |

## Exemplos de uso no React

```js
// Buscar todos os alimentos
const res = await fetch('http://localhost:3001/alimentos');
const data = await res.json();

// Buscar refeições de um usuário
const res = await fetch('http://localhost:3001/refeicoes?usuarioId=1');

// Adicionar refeição
await fetch('http://localhost:3001/refeicoes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usuarioId: 1, meal: 'Almoço', calories: 500 })
});

// Atualizar
await fetch('http://localhost:3001/refeicoes/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ calories: 550 })
});

// Deletar
await fetch('http://localhost:3001/refeicoes/1', { method: 'DELETE' });
```
