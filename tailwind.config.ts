
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        chatgpt: {
          sidebar: "#202123",
          main: "#343541",
          secondary: "#444654",
          hover: "#2A2B32",
          border: "#565869"
        },
        adgentic: {
          sidebar: "#ffffff",
          main: "#f8fafc",  // slate-50
          secondary: "#f1f5f9", // slate-100
          accent: "#2563eb", // blue-600
          hover: "#f1f5f9",
          border: "#e5e5e5", // Lighter border color
          white: "#ffffff",  // White
          lightGray: "#f7f7f8", // Light gray background
          inputBg: "#ffffff", // White input background
          text: {
            primary: "#343541", // Main text color
            secondary: "#6e6e80", // Secondary text color
            light: "#94a3b8", // slate-400
          }
        },
        adspirer: {
          main: "#f8fafc",  // Adding the missing color - using same as adgentic.main
          border: "#e5e5e5",
          text: {
            primary: "#343541",
          },
          hover: "#f1f5f9",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
