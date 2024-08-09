import { 
  Box,
  useColorMode,
  IconButton,
  HStack,
  Button
 } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  
  return (
    <Box as='header'>
      <IconButton
        size='sm'
        icon={ colorMode === 'light' ? <MoonIcon /> : <SunIcon /> }
        onClick={ toggleColorMode } // toggle between light and dark mode
        aria-label={ colorMode === 'light' ? 'Activate dark mode' : 'Activate light mode'}
      />
      <HStack spacing='24px'>
        <a href="/">
          <Button>home</Button>
        </a>
        <a href="/petra_wallet">
          <Button>petra wallet demo</Button>
        </a>
        <a href="/endless_h5_wallet_demo">
          <Button>endless h5 wallet demo</Button>
        </a>
        <a href="/test_shuffler">
          <Button>Test shuffler</Button>
        </a>
        <a href="/lucky_box">
          <Button>Lucky Box</Button>
        </a>
      </HStack>
    </Box>
  )
}

export default Header