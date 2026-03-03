/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#6B4FBB",
                accent: "#5839B3",
                background: "#F8F7FF",
                text: "#2B2B2B",
                success: "#064E3B",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
            }
        },
    },
    plugins: [],
}
