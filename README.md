# birthdaycard — Georgia Hoffmann 24

Convite interativo de uma única tela para o aniversário de 24 anos de Georgia Hoffmann
(**10.10 às 19h, no Meio Cheio**), com estética terminal / cyber-industrial.

## Objetivo

Informar os detalhes da festa e engajar os convidados: cada pessoa pode trocar as cores do
site e enviar uma foto própria, que vira o rosto do cubo 3D central. O PRD original está em
[`prd_convite_de_anivers_rio_24_anos_georgia_hoffmann.md`](./prd_convite_de_anivers_rio_24_anos_georgia_hoffmann.md).

## Funcionalidades

- Cubo 3D que gira continuamente e responde ao mouse (desktop) ou ao arrasto do dedo (mobile).
- As 6 faces mostram o rosto inteiro em close, com iluminação direcional e relevo de pele.
- Upload de foto: o rosto é detectado no navegador e recortado em close (a foto não sai do dispositivo).
- Seletores de cor para fundo e texto, aplicados em tempo real.
- Botão "Adicionar na agenda" (Google Calendar: 10/10, 19h–23h) e link para o Instagram do bar.
- Layout de viewport único, sem rolagem, para desktop e mobile.

## Tecnologias

- HTML, CSS e JavaScript (ES modules), sem build.
- [Three.js](https://threejs.org/) (WebGL) para o cubo, carregado por CDN via import map.
- [MediaPipe Tasks Vision](https://developers.google.com/mediapipe) (Face Detector) para o recorte do rosto; se falhar, usa um recorte central.
- CSS com variáveis (`--bg`, `--fg`) para a troca de cores; fonte `BDO Grotesk` com fallback monoespaçado.
- Deploy estático na Vercel.

## Rodando localmente

```bash
npm run dev   # http://localhost:5173
```

Requer conexão com a internet (Three.js e o modelo de detecção de rosto vêm de CDN).
