import type { ThemeConfig } from 'antd';

// Design system "Trust & Authority" (B2B sobrio): navy + azul CTA + oro champán.
export const FONT_FAMILY =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export const COLORS = {
  navy: '#0F172A',
  accent: '#0369A1',
  background: '#F8FAFC',
  // Oro champán: acento premium reservado a hairlines y marcas, no a superficies.
  gold: '#C6A15B',
};

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: COLORS.accent,
    colorLink: COLORS.accent,
    colorLinkHover: '#0284C7',
    colorBgLayout: COLORS.background,
    colorTextHeading: COLORS.navy,
    colorText: '#1E293B',
    colorTextSecondary: '#64748B',
    colorBorderSecondary: '#EEF2F7',
    borderRadius: 10,
    borderRadiusLG: 14,
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    // Sombras suaves y difusas (nada de bordes duros) para dar profundidad discreta.
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -16px rgba(15, 23, 42, 0.28)',
    boxShadowSecondary: '0 12px 32px -18px rgba(15, 23, 42, 0.35)',
    controlHeight: 38,
  },
  components: {
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: '0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 30px -20px rgba(15, 23, 42, 0.3)',
      colorBorderSecondary: 'rgba(15, 23, 42, 0.06)',
      paddingLG: 24,
    },
    Button: {
      fontWeight: 600,
      controlHeight: 38,
      primaryShadow: '0 8px 18px -10px rgba(3, 105, 161, 0.6)',
    },
    Table: {
      headerBg: '#F8FAFC',
      headerColor: COLORS.navy,
      headerSplitColor: 'transparent',
      borderColor: '#EEF2F7',
      rowHoverBg: 'rgba(3, 105, 161, 0.04)',
      cellPaddingBlock: 14,
    },
    Statistic: {
      titleFontSize: 13,
      contentFontSize: 30,
    },
    Menu: {
      itemSelectedColor: COLORS.accent,
      itemSelectedBg: 'rgba(3, 105, 161, 0.08)',
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Segmented: {
      borderRadius: 10,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Input: {
      controlHeight: 38,
      activeShadow: '0 0 0 3px rgba(3, 105, 161, 0.12)',
    },
    Select: {
      controlHeight: 38,
    },
  },
};
