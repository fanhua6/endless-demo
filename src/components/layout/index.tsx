import { ReactNode } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import {
  Box
} from '@chakra-ui/react'
import '../../assets/scss/global.scss'
import Header from './Header'
import theme from './theme'
import 'react-datepicker/dist/react-datepicker.css'

const WalletLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ChakraProvider theme={ theme }>
      <Box as='main' w='100%' h='100%'>
        <Header />
        { children }
      </Box>  
    </ChakraProvider>
  )
}

export default WalletLayout