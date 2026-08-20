import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          strong: "hsl(var(--primary-strong))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        "sea-deep": "hsl(var(--sea-deep))",
        navy: "hsl(var(--navy))",
        "sea-light": "hsl(var(--sea-light))",
        "sea-mist": "hsl(var(--sea-mist))",
        coral: {
          DEFAULT: "hsl(var(--coral))",
          deep: "hsl(var(--coral-deep))",
        },
        ok: {
          DEFAULT: "hsl(var(--ok))",
          bg: "hsl(var(--ok-bg))",
        },
        "slate-icon": "hsl(var(--slate-icon))",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-fraunces)", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.375rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px hsla(220,100%,50%,.08)",
        card: "0 4px 25px -5px hsla(220,100%,50%,.12)",
        elevated: "0 14px 44px -12px hsla(220,100%,30%,.28)",
      },
      backgroundImage: {
        "gradient-sea":
          "linear-gradient(135deg, hsl(220 100% 50%), hsl(220 100% 35%))",
        "gradient-warm":
          "linear-gradient(135deg, hsl(2 97% 66%), hsl(18 90% 64%))",
        "hero-overlay":
          "linear-gradient(180deg, hsla(220,100%,10%,.72) 0%, hsla(220,100%,16%,.30) 40%, hsla(220,100%,8%,.88) 100%)",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "none" },
        },
        sparkle: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
          "50%": { transform: "scale(1.25) rotate(12deg)", opacity: ".7" },
        },
        orbpulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 hsla(220,100%,55%,.5)" },
          "50%": { boxShadow: "0 0 0 14px hsla(220,100%,55%,0)" },
        },
        shimmer: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
        msgin: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
      },
      animation: {
        rise: "rise .7s both",
        sparkle: "sparkle 2.4s ease-in-out infinite",
        orbpulse: "orbpulse 1.8s ease-in-out infinite",
        shimmer: "shimmer 1.6s infinite",
        msgin: "msgin .25s both",
        float: "float 4s ease-in-out infinite",
        "float-slow": "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
