# Product Requirements Document (PRD)

## Single-Viewport Birthday Invitation Web Application ("Georgia Hoffmann 24")

### 1. Visão Geral do Projeto

O projeto consiste em uma aplicação web de **viewport único** (single-page / single-screen) projetada para funcionar como um convite interativo e imersivo para o aniversário de 24 anos de Georgia Hoffmann. A interface adota o conceito visual **Terminal CLI / Cyber-Industrial / Hacker**, fundindo a estética retrô de sistemas de computação de alta performance com interações 3D modernas, tipografia marcante (`BDO Grotesk` / monspaced equivalents) e customização em tempo real pelo usuário.

### 2. Objetivos e Público-Alvo

* **Objetivo Principal:** Fornecer um convite digital memorável, interativo e funcional que informe os detalhes da festa e permita engajamento através de customizações visuais e upload de fotos.

* **Público-Alvo:** Amigos, convidados e conhecidos da aniversariante.

* **Plataformas / Responsividade:** Otimizado desde o início para dois principais pontos de quebra (breakpoints): **Web (Desktop)** e **Mobile (Smartphones)**, garantindo adaptação fluida sem rolagem vertical (viewport único).

### 3. Requisitos Funcionais (RF)

#### 3.1. Elemento Central 3D (Cubo Rotativo)

* **Comportamento:** Um cubo 3D centralizado na tela.

* **Interatividade:** O cubo gira interativamente conforme o usuário move o mouse (desktop) ou arrasta o dedo pelo mousepad/touchscreen (mobile).

* **Textura Padrão:** As faces do cubo contêm uma foto da aniversariante (Georgia Hoffmann).

* **Upload de Foto pelo Usuário:**

  * O usuário final pode enviar uma foto própria através de um controle na barra inferior flutuante.

  * Ao carregar a imagem, a textura do cubo 3D é atualizada dinamicamente para exibir o rosto/foto do usuário convidado nas faces do bloco.

#### 3.2. Informações do Convite (Texto de Fundo)

* **Posicionamento:** Exibido estruturalmente atrás/ao redor do elemento central 3D dentro do viewport.

* **Conteúdo Textual Obrigatório:**

  * `GEORGIA HOFFMANN`

  * `ANIVERSARIO `

  * `24 UNIDADES DE ANO`

  * `10.10 ÀS 19H`

  * `NO MEIO CHEIO`

* **Links e Interatividade Textual:**

  * A localização (**bar Meio Cheio**) deve ser um hiperlink clicável que direciona para o perfil oficial no Instagram: `https://www.instagram.com/meiocheio__/`.

#### 3.3. Ações e Integrações Externas

* **Botão "Adicionar Evento na Agenda":**

  * Um botão dedicado no layout.

  * Ao ser acionado, abre diretamente uma aba no **Google Calendar** com os dados pré-configurados:

    * **Título:** Aniversario Georgia

    * **Horário:** 19h - 23h

    * **Data:** 10 de Outubro (10.10)

#### 3.4. Navbar Inferior Flutuante (Customizações)

* Uma barra flutuante fixa na parte inferior da tela contendo:

  1. **Seletor de Cores (Color Wheel):** Permite alterar em tempo real a cor de fundo (`background`) e a cor da fonte (`foreground`) do site.

  2. **Botão de Upload de Imagem:** Permite selecionar um arquivo de imagem local do dispositivo do usuário para substituir a face do cubo 3D.

### 4. Requisitos Não-Funcionais (RNF) & Design System

* **Estética Visual (Terminal CLI / Cyber-Industrial):**

  * **Tipografia:** Uso da fonte principal solicitada (`BDO Grotesk`) combinada com pilares de tipografia monospassada.

  * **Paleta de Cores Base (Padrão Inicial):**

    * Fundo: Preto profundo (`#0a0a0a`) com sobreposição sutil de CRT Scanlines.

    * Texto/Primary: Verde Terminal (`#33ff00`) ou personalizável via color wheel.

  * **Bordas & Raios:** `border-radius: 0px` (cantos estritamente retangulares), bordas de 1px sólidas ou tracejadas imitando janelas de terminal (`tmux`/`vim`).

  * **Efeitos:** Leve brilho de texto (*text-shadow glow*) simulando monitores de fósforo antigo.

* **Desempenho:**

  * Renderização 3D otimizada via WebGL/CSS 3D Transforms para garantir alta taxa de quadros (60fps) tanto em desktop quanto em dispositivos móveis.

  * Gerenciamento de estado leve para reatividade instantânea da Color Wheel e do Upload de Imagens.

### 5. Histórias de Usuário / Casos de Uso Prioritários

1. **Como convidado**, quero acessar o link do convite e visualizar imediatamente o cubo 3D giratório com as informações da festa ao fundo.

2. **Como convidado**, quero interagir com o mouse/touchpad para rotacionar o cubo 3D e explorar a perspectiva visual.

3. **Como convidado**, quero clicar na localização "Meio Cheio" para abrir o Instagram do bar rapidamente.

4. **Como convidado**, quero clicar no botão do Google Agenda para salvar o evento (10.10 das 19h às 23h) no meu calendário.

5. **Como convidado**, quero usar a navbar inferior para abrir a color wheel e personalizar as cores do site, além de enviar uma foto minha para ver meu rosto renderizado no cubo 3D central.

### 6. Considerações de Implementação (Tech Stack & Estrutura)

* **Framework:** React / Next.js (ou HTML/JS modular via VS Code, conforme ambiente atual do Claude).

* **Estilização:** Tailwind CSS ajustado com tokens customizados para a estética retro-terminal (sem border-radius, cores dinâmicas via variáveis CSS injetadas pela Color Wheel).

* **3D Engine:** Three.js ou CSS 3D Transforms para a manipulação do cubo texturizado com suporte a upload de imagem via `FileReader` API.