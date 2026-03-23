/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                profit: {
                    light: '#10b981',
                    DEFAULT: '#059669',
                    dark: '#047857',
                },
                loss: {
                    light: '#ef4444',
                    DEFAULT: '#dc2626',
                    dark: '#b91c1c',
                },
                info: {
                    light: '#3b82f6',
                    DEFAULT: '#2563eb',
                    dark: '#1d4ed8',
                },
                dark: {
                    bg: '#0f172a',
                    card: '#1e293b',
                    hover: '#334155',
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.3s ease-in',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
