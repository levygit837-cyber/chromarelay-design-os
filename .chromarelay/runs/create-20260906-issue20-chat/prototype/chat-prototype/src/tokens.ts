/**
 * Canonical tokens, resolved to concrete values for the prototype.
 * Source: context/tokens.primitive.json + tokens.semantic.json + tokens.component.json
 * (Run create-20260906-issue20-chat). Component roles cite semantic names only.
 */
export const tokens = {
  color: {
    paper: '#F5F2EC',
    paperDeep: '#EFE9DD',
    card: '#FFFDF8',
    well: '#FAF7EF',
    ink: '#1A1815',
    ink2: '#45403A',
    muted: '#5B5346',
    line: '#D8D1C2',
    hair: '#E4DED1',
    graphite: '#3A372F',
    ok: '#1D7A3A',
    okBg: '#E6F2E8',
    okInk: '#14522A',
    warn: '#8A5A00',
    warnBg: '#F9EDD2',
    warnInk: '#6A4500',
    bad: '#B3261E',
    badBg: '#F9E4E1',
    badInk: '#8C1D17',
    accent: '#1A4FA0',
    cmdoutBg: '#211F1B',
    cmdoutText: '#F0EAD9',
    cmdoutPass: '#8FD694',
    cmdoutFail: '#FF9D94',
    diffAddBg: '#DCF0DF',
    diffAddInk: '#14522A',
    diffDelBg: '#FBE3E0',
    diffDelInk: '#7C1D17',
    scrim: 'rgba(26,24,21,0.45)',
  },
  space: { 4: 4, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 20: 20, 24: 24, 26: 26 },
  size: {
    controlMin: 44,
    node: 30,
    nodeStrip: 26,
    spineRail: 92,
    wingLeft: 268,
    wingRight: 340,
    ticketEdge: 5,
    spineRule: 2,
    focusRing: 3,
  },
  radius: { none: 0, sm: 2, round: 999 },
  font: {
    sans: '"Helvetica Neue", Helvetica, Arial, Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    // Offline-safe condensed chain; Impact excluded per EX-03.
    numeral:
      '"Arial Narrow", "HelveticaNeue-CondensedBold", "Franklin Gothic Condensed", "DIN Condensed", "Helvetica Neue", Arial, system-ui, sans-serif',
  },
  elevation: { active: '0 10px 30px rgba(26,24,21,0.16)' },
  motion: { echoMs: 300, pulseMs: 1600 },
} as const;

export type StatusKind = 'ok' | 'run' | 'bad' | 'idle';

export const statusWord: Record<StatusKind, string> = {
  ok: 'Done',
  run: 'Running',
  bad: 'Failed',
  idle: 'Queued',
};

export const statusGlyph: Record<StatusKind, string> = {
  ok: '●',
  run: '◐',
  bad: '■',
  idle: '○',
};
