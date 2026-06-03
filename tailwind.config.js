import { colors, motion, radius, shadow, space, type } from './frontend/src/styles/tokens.js'

export default {
  content: ['./frontend/index.html', './frontend/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: [type.sans],
        mono: [type.mono],
      },
      spacing: space,
      borderRadius: radius,
      boxShadow: shadow,
      transitionDuration: {
        fast: `${motion.fast.duration * 1000}ms`,
        normal: `${motion.normal.duration * 1000}ms`,
        slow: `${motion.slow.duration * 1000}ms`,
      },
    },
  },
}
