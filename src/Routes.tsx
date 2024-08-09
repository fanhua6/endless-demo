import { Route, Routes } from 'react-router-dom';
import WalletLayout from './components/layout';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import WalletH5Demo from './pages/wallet-demo';
import PetraWallet from './pages/petra-wallet';
import MyWallet from './pages/my-wallet';
import TestShuffle from './pages/test-shuffle';
import RedEnvelope from './pages/red-envelope';

const WalletRoutes = () => {
  return (
    <WalletLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/endless_h5_wallet_demo" element={<WalletH5Demo />} />
        <Route path="/petra_wallet" element={<PetraWallet />} />
        <Route path="/my_wallet" element={<MyWallet />} />
        <Route path="/test_shuffler" element={<TestShuffle />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/lucky_box" element={<RedEnvelope />} />
      </Routes>
    </WalletLayout>
  )
}

export default WalletRoutes;