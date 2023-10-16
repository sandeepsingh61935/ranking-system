// eslint-disable-next-line @typescript-eslint/no-var-requires
import  colors  from 'tailwindcss/colors';

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: colors.orange,
        purple: colors.violet,
      },
    },
  },
  plugins: [],
};
