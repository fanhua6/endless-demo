import { extendTheme, type ThemeConfig, type ComponentStyleConfig } from '@chakra-ui/react'


const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
}

const componentStyle: ComponentStyleConfig = {
  baseStyle: {
    ':root':{
      '--chakra-colors-gray-800': 'red'
    }
  },
}

const theme = extendTheme({
  config,
  componentStyle,
})

export default theme