/**
 * Tokens — Ink and Gunsmoke.
 * Valores espelhados de tokens.json (Run cr21-battleground-a1, contexto somente-leitura).
 * Componentes consomem estes papéis via tokens.css; nunca hex cru fora daqui.
 */
export const TOKENS = {
  color: {
    paper: '#FDFBF6',
    ink: '#131212',
    inkSoft: '#2A2928',
    washLight: '#E8E2D6',
    parchment: '#F4EEE1',
    washDark: '#9A958C',
    washCool: '#D8D5CC',
    washWarm: '#E2D8C6',
    vermilion: '#C73E1D',
    vermilionDeep: '#A32F14',
  },
  typography: {
    displayFamily: "'Playfair Display', 'Bodoni MT', Didot, Georgia, serif",
    dataFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fighterName: '40px',
    countdown: '160px',
    ko: '96px',
    menuTitle: '32px',
    damage: '20px',
    cooldown: '14px',
    meterLabel: '12px',
    body: '15px',
    mapStrip: '12px',
  },
  hud: {
    healthRuleW: 320,
    healthRuleH: 6,
    meterSeal: 44,
    pip: 18,
    meterMax: 100,
  },
  stage: {
    width: 1280,
    height: 720,
  },
  motion: {
    burstMinMs: 150,
    burstMaxMs: 300,
    strokeFadeS: 1.2,
    strokeMax: 6,
    ultimateFreezeMs: 250,
    hitstunMinMs: 120,
    hitstunMaxMs: 180,
  },
} as const;
