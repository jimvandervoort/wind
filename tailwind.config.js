/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,vue}",
    ],
    theme: {
        extend: {
            rotate: {
                '270': '270deg',
            },
        },
    },
    plugins: [],
}
