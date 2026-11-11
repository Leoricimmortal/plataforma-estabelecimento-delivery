# Chegou Delivery · Painel do Lojista (React)

Painel administrativo das lojas (restaurantes, farmácias, mercados) da plataforma Chegou Delivery.
Esta é a versão em **React + Vite** do painel que antes era um único arquivo HTML. Todas as telas, janelas e regras foram mantidas.

## Como rodar (Windows / PowerShell)

Pré-requisito: **Node.js 18 ou mais novo** (https://nodejs.org). Confira com `node -v`.

```powershell
cd chegou-delivery-react
npm install
npm run dev
```

O navegador abre em `http://localhost:5173`.

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Modo de desenvolvimento, recarrega sozinho ao salvar |
| `npm run build` | Gera a versão final na pasta `dist/` |
| `npm run preview` | Abre a versão da pasta `dist/` para conferir antes de publicar |

A pasta `dist/` pode ser enviada para qualquer hospedagem de site estático (Netlify, Vercel, Hostinger, S3, Nginx). As rotas usam `#` (ex.: `#produtos`), então não é preciso configurar o servidor.

> Se o PowerShell bloquear o `npm` com erro de "execução de scripts desabilitada", rode uma vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

## Estrutura

```
src/
  main.jsx              entrada: carrega os estilos e o App
  App.jsx               layout (menu, topo, tela atual), relógio da simulação e rotas
  styles/               tokens.css (cores e fontes), layout.css (estrutura), components.css (o resto)
  store/
    useApp.js           estado global (Zustand + Immer): mut(), openModal(), toast()
    actions.js          ações que juntam regra + estado + aviso (é aqui que entra a API depois)
  domain/               regras de negócio sem tela
    pedidos.js          etapas, código de coleta, aceite do entregador, ETA, simulação
    chat.js             conversa com o entregador e respostas simuladas
    catalogo.js         ordem única de produtos e kits por categoria
    clientes.js         última compra e próximo número de pedido
  lib/                  utilitários: formato (R$, datas, telefone), horários, CEP, imagens, planilhas, som, geo
  data/seed.js          dados de demonstração (substituir pela API)
  hooks/                useRoute (rotas por #), useCep, useRowDrag (arrastar linhas)
  components/           peças reutilizáveis: Sidebar, Topbar, Toast, ModalHost, ChatWindow, MapView, ui.jsx, art.jsx, Icon.jsx
  modals/               janelas: Pedido, Pedido manual, Cliente, Importar, Kit, Categoria, Editar produto, Adicionar produto, Fidelidade
  pages/                as 17 telas do painel
```

### Como o estado funciona

- Tudo fica em um único store (`useApp`). Componentes leem só o que precisam: `useApp((s) => s.kits)`.
- Para alterar, use `mut((s) => { s.kits.push(...) })`. O Immer cuida de não mutar o original.
- Janelas: `openModal('kit', { id })` e `closeModal()`. Avisos: `toast('Texto')`.
- Compare objetos por `id`, nunca por referência (o Immer cria cópias novas a cada alteração).

### Ícones

Os ícones vêm do `lucide-react` e ficam mapeados em `src/components/Icon.jsx`. Para usar um ícone novo, importe-o lá e adicione no objeto `ICONS` com o nome em kebab-case (o mesmo do site lucide.dev). Use `<Icon name="shield-check" />`.

## O que é simulação (até existir back-end e app do entregador)

- **Dados**: vêm de `src/data/seed.js` e ficam só na memória. Ao recarregar a página, voltam ao início.
- **Entregadores**: o aceite acontece sozinho entre 10 e 25 segundos depois que o pedido fica pronto, e a chegada segue o tempo de viagem. Na tela Coleta há botões para simular o aceite e a chegada na hora.
- **Chat**: as respostas do entregador são automáticas (`respostaSimulada` em `domain/chat.js`).
- **Mapa**: usa OpenStreetMap, que não exige chave. Para produção, troque por um provedor com chave (Google Maps, Mapbox ou MapTiler) em `components/MapView.jsx` e use a posição real enviada pelo app do entregador.
- **CEP**: busca no ViaCEP e depois na BrasilAPI. Sem internet, identifica cidade e UF pela faixa do CEP. Em produção, faça essa busca pelo back-end, com cache.

## Próximos passos sugeridos

1. Criar a API e trocar o `seed.js` por chamadas a ela dentro de `store/actions.js`.
2. Receber os pedidos e a posição do entregador em tempo real (WebSocket ou Server-Sent Events) no lugar do `tick()` do `App.jsx`.
3. Login e permissões por perfil (Administrador, Gerente, Operador), usando as permissões já desenhadas na tela Usuários.
