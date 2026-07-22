
export const theme = {
  colors: {
    // Brand — "Clinical Precision" (Emerald variant)
    primary: "#0f766e",
    onPrimary: "#ffffff",
    primaryContainer: "#0d9488",
    onPrimaryContainer: "#f0fdfa",

    secondary: "#0d9488",
    onSecondary: "#ffffff",
    secondaryContainer: "#2dd4bf",
    onSecondaryContainer: "#003731",

    tertiary: "#943700",
    onTertiary: "#ffffff",
    tertiaryContainer: "#bc4800",
    onTertiaryContainer: "#ffede6",

    // Background & Surface
    background: "#f7f9fb",
    onBackground: "#1a1c1e",

    surface: "#f7f9fb",
    surfaceBright: "#ffffff",
    surfaceDim: "#d8dadc",

    surfaceContainerLowest: "#ffffff",
    surfaceContainerLow: "#f1f5f4",
    surfaceContainer: "#eaeef0",
    surfaceContainerHigh: "#e3e8ea",
    surfaceContainerHighest: "#dde3e5",

    surfaceVariant: "#e2e8f0",

    onSurface: "#1a1c1e",
    onSurfaceVariant: "#44474e",

    inverseSurface: "#2e3132",
    inverseOnSurface: "#f0f4f3",
    inversePrimary: "#5eead4",

    outline: "#64748b",
    outlineVariant: "#e2e8f0",

    surfaceTint: "#0f766e",

    // Semantic
    success: "#10b981",
    warning: "#f59e0b",

    error: "#ba1a1a",
    onError: "#ffffff",
    errorContainer: "#ffdad6",
    onErrorContainer: "#93000a",
  },

  typography: {
    fontFamily: {
      sans: "Inter, system-ui, sans-serif",
    },

    fontSize: {
      caption: "12px",
      label: "14px",
      body: "16px",
      bodyLg: "18px",
      headlineMd: "24px",
      headlineLg: "32px",
      display: "48px",
    },

    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      caption: "1.4",
      label: "1.2",
      body: "1.5",
      bodyLg: "1.6",
      heading: "1.2",
      display: "1.1",
    },

    letterSpacing: {
      normal: "0",
      label: "0.05em",
      heading: "-0.02em",
    },
  },

  spacing: {
    base: "4px",

    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2.5rem",
    xl: "4rem",

    section: "4rem",
    containerPadding: "24px",
    gutter: "24px",
  },

  radius: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },

  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",

    md: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)",

    lg: "0 20px 25px -5px rgba(0,0,0,0.1)",

    xl: "0 25px 50px -12px rgba(0,0,0,0.18)",
  },

  blur: {
    glass: "12px",
  },

  borders: {
    thin: "1px",
    medium: "2px",
  },

  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  layout: {
    container: "1280px",

    columns: {
      mobile: 4,
      tablet: 8,
      desktop: 12,
    },

    margins: {
      mobile: "20px",
      tablet: "40px",
      desktop: "80px",
    },

    gutters: {
      mobile: "16px",
      tablet: "20px",
      desktop: "24px",
    },
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },

  motion: {
    duration: {
      fast: "150ms",
      normal: "250ms",
      slow: "400ms",
    },

    easing: {
      standard: "cubic-bezier(0.4, 0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0, 1, 1)",
      decelerate: "cubic-bezier(0, 0, 0.2, 1)",
    },
  },
} as const;

export type Theme = typeof theme;
