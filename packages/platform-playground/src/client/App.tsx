import { useState } from 'react';
import { Menu } from './components/Menu';

import { AuthPage } from './pages/Auth';
import { QueryPage } from './pages/Query';

import { useAuth } from './contexts/AuthContext';

function App() {
  const { getWebToken, getxHomeToken, getxCloudToken } = useAuth();
  const [currentpage, setCurrentpage] = useState('auth');

  const renderPage = () => {
    switch (currentpage) {
      case 'auth':
        return <AuthPage />;
      case 'profile_get_current':
        return <QueryPage
                key="profile_get_current"
                method="profile_get_current"
                title="Profile: Get Current"
                sendData={getWebToken()} />;
      case 'smartglass_consoles_list':
        return <QueryPage
                key="smartglass_consoles_list"
                method="smartglass_consoles_list"
                title="Smartglass: Consoles List"
                sendData={getWebToken()} />;
      case 'gamepass_get_titles':
        return <QueryPage
                key="gamepass_get_titles"
                method="gamepass_get_titles"
                title="Gamepass: Get Titles"
                sendData={getxCloudToken()} />;
      case 'gamepass_get_recent_titles':
        return <QueryPage
                key="gamepass_get_recent_titles"
                method="gamepass_get_recent_titles"
                title="Gamepass: Get Recent Titles"
                sendData={getxCloudToken()} />;
      case 'gamepass_batch_productids':
        return <QueryPage
                key="gamepass_batch_productids"
                method="gamepass_batch_productids"
                title="Gamepass: Batch Product IDs"
                sendData={{ token: getxCloudToken(), productIds: ':productIds' }}
                fields={{
                  productIds: '["BX3M8L83BBRW","9MT5NJ5W7B8Z"]',
                }} />;
      case 'gamepass_resolve_productid':
        return <QueryPage
                key="gamepass_resolve_productid"
                method="gamepass_resolve_productid"
                title="Gamepass: Resolve Product ID"
                sendData={{ token: getxCloudToken(), productId: ':productId' }}
                fields={{
                  productId: 'BX3M8L83BBRW'
                }} />;
      default:
        return <AuthPage />;
    }
  };

  return (
    <>
      <header id="header">
        <h1>Greenlight Platform Playground</h1>
      </header>
      <div id="main-container">
        <div id="submenu">
          <Menu setCurrentPage={setCurrentpage} />
        </div>
        <div id="content">
          {renderPage()}
        </div>
      </div>
    </>
  );
}

export default App;
