/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./pages/**/*.{js,ts,jsx,tsx}",
	  "./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
	  extend: {
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)'
		},
		colors: {
		  background: 'hsl(var(--background))',
		  foreground: 'hsl(var(--foreground))',
		  card: {
			DEFAULT: 'hsl(var(--card))',
			foreground: 'hsl(var(--card-foreground))'
		  },
		  popover: {
			DEFAULT: 'hsl(var(--popover))',
			foreground: 'hsl(var(--popover-foreground))'
		  },
		  primary: {
			DEFAULT: 'hsl(var(--primary))',
			foreground: 'hsl(var(--primary-foreground))'
		  },
		  secondary: {
			DEFAULT: 'hsl(var(--secondary))',
			foreground: 'hsl(var(--secondary-foreground))'
		  },
		  muted: {
			DEFAULT: 'hsl(var(--muted))',
			foreground: 'hsl(var(--muted-foreground))'
		  },
		  accent: {
			DEFAULT: 'hsl(var(--accent))',
			foreground: 'hsl(var(--accent-foreground))'
		  },
		  destructive: {
			DEFAULT: 'hsl(var(--destructive))',
			foreground: 'hsl(var(--destructive-foreground))'
		  },
		  border: 'hsl(var(--border))',
		  input: 'hsl(var(--input))',
		  ring: 'hsl(var(--ring))',
		  chart: {
			'1': 'hsl(var(--chart-1))',
			'2': 'hsl(var(--chart-2))',
			'3': 'hsl(var(--chart-3))',
			'4': 'hsl(var(--chart-4))',
			'5': 'hsl(var(--chart-5))'
		  }
		},
		keyframes: {
		  'accordion-down': {
			from: { height: '0' },
			to: { height: 'var(--radix-accordion-content-height)' }
		  },
		  'accordion-up': {
			from: { height: 'var(--radix-accordion-content-height)' },
			to: { height: '0' }
		  },
		  fadeIn: {
			'0%': { opacity: '0' },
			'100%': { opacity: '1' }
		  },
		  slideDown: {
			'0%': { transform: 'translateY(-10px)', opacity: '0' },
			'100%': { transform: 'translateY(0)', opacity: '1' }
		  },
		  slideUp: {
			'0%': { transform: 'translateY(10px)', opacity: '0' },
			'100%': { transform: 'translateY(0)', opacity: '1' }
		  },
		  slideLeft: {
			'0%': { transform: 'translateX(10px)', opacity: '0' },
			'100%': { transform: 'translateX(0)', opacity: '1' }
		  },
		  slideRight: {
			'0%': { transform: 'translateX(-10px)', opacity: '0' },
			'100%': { transform: 'translateX(0)', opacity: '1' }
		  },
		  'spin-slow': {
			'0%': { transform: 'rotate(0deg)' },
			'100%': { transform: 'rotate(360deg)' }
		  }
		},
		animation: {
		  'accordion-down': 'accordion-down 0.2s ease-out',
		  'accordion-up': 'accordion-up 0.2s ease-out',
		  'fadeIn': 'fadeIn 0.5s ease-in forwards',
		  'slideDown': 'slideDown 0.5s ease-out forwards',
		  'slideUp': 'slideUp 0.5s ease-out forwards',
		  'slideLeft': 'slideLeft 0.5s ease-out forwards',
		  'slideRight': 'slideRight 0.5s ease-out forwards',
		  'spin-slow': 'spin-slow 3s linear infinite'
		}
	  }
	},
	plugins: [require("tailwindcss-animate")]
  }