import { createTheme, MantineColorsTuple } from '@mantine/core';

const cinemaGold: MantineColorsTuple = [
  '#fff9e6', '#fff0c2', '#ffe699', '#ffdb70', '#ffd147',
  '#e6b800', '#cc9900', '#b38600', '#997300', '#806000',
];

export const theme = createTheme({
  primaryColor: 'cinema',
  colors: {
    cinema: cinemaGold,
    dark: [
      '#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', '#373A40',
      '#2C2E33', '#25262B', '#1A1B1E', '#141517', '#101113',
    ],
  },
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '700',
  },
  defaultRadius: 'md',
  components: {
    Button: { defaultProps: { radius: 'md' } },
    Card: { defaultProps: { radius: 'md', withBorder: true } },
    Paper: { defaultProps: { radius: 'md' } },
  },
});
