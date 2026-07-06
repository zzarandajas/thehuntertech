import type { ThemeConfig } from 'antd';

// Design system "Trust & Authority" (B2B sobrio): navy + azul CTA.
export const FONT_FAMILY =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export const COLORS = {
  navy: '#0F172A',
  accent: '#0369A1',
  background: '#F8FAFC',
};

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: COLORS.accent,
    colorLink: COLORS.accent,
    colorBgLayout: COLORS.background,
    borderRadius: 8,
    fontFamily: FONT_FAMILY,
  },
  components: {
    Layout: {
      headerBg: COLORS.navy,
      siderBg: COLORS.navy,
    },
    Menu: {
      darkItemBg: COLORS.navy,
      darkSubMenuItemBg: COLORS.navy,
      darkItemSelectedBg: COLORS.accent,
    },
  },
};
