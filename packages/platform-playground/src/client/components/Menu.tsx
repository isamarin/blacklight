import { useAuth } from '../contexts/AuthContext';

export function Menu({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const { isAuthenticated } = useAuth();

  return (
    <>
        <div className="procedure-menu">
            <div className="procedure-list">

                <div key="auth" className="procedure-category">
                    <h3>Auth</h3>
                    <button
                        key="auth_login"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('auth'); }}
                    >
                        <span className="procedure-name">auth</span>
                        <span className={`procedure-type query`}>auth</span>
                    </button>
                </div>

            </div>
        </div>

        { isAuthenticated && <div className="procedure-menu">
            <div className="procedure-list">

                <div key="auth" className="procedure-category">
                    <h3>Profile</h3>
                    <button
                        key="profile_get_current"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('profile_get_current'); }}
                    >
                        <span className="procedure-name">profile_get_current</span>
                        <span className={`procedure-type query`}>Query</span>
                    </button>
                    
                    <button
                        key="profile_get_friends"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('profile_get_friends'); }}
                    >
                        <span className="procedure-name">profile_get_friends</span>
                        <span className={`procedure-type query`}>Query</span>
                    </button>
                </div>

                <div key="smartglass" className="procedure-category">
                    <h3>Smartglass</h3>
                    <button
                        key="smartglass_consoles_list"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('smartglass_consoles_list'); }}
                    >
                        <span className="procedure-name">smartglass_consoles_list</span>
                        <span className={`procedure-type query`}>Query</span>
                    </button>
                </div>

                <div key="gamepass" className="procedure-category">
                    <h3>Gamepass</h3>
                    <button
                        key="gamepass_get_titles"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('gamepass_get_titles'); }}
                    >
                        <span className="procedure-name">gamepass_get_titles</span>
                        <span className={`procedure-type query`}>Query</span>
                    </button>

                    <button
                        key="gamepass_get_recent_titles"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('gamepass_get_recent_titles'); }}
                    >
                        <span className="procedure-name">gamepass_get_recent_titles</span>
                        <span className={`procedure-type query`}>Query</span>
                    </button>

                    <button
                        key="gamepass_get_new_titles"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('gamepass_get_new_titles'); }}
                    >
                        <span className="procedure-name">gamepass_get_new_titles</span>
                        <span className={`procedure-type query`}>Query</span>
                    </button>

                    <button
                        key="gamepass_batch_productids"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('gamepass_batch_productids'); }}
                    >
                        <span className="procedure-name">gamepass_batch_productids</span>
                        <span className={`procedure-type query`}>Query</span>
                    </button>

                    <button
                        key="gamepass_resolve_productid"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('gamepass_resolve_productid'); }}
                    >
                        <span className="procedure-name">gamepass_resolve_productid</span>
                        <span className={`procedure-type query`}>Query</span>
                    </button>
                </div>

                <div key="streaming" className="procedure-category">
                    <h3>Streaming</h3>
                    <button
                        key="streaming_start_stream"
                        className="procedure-item"
                        onClick={() => { setCurrentPage('streaming_start_stream'); }}
                    >
                        <span className="procedure-name">streaming_start_stream</span>
                        <span className={`procedure-type query`}>Query</span>
                    </button>
                </div>

            </div>
        </div> }

        { isAuthenticated && <div className="procedure-menu">

            <div key="player" className="procedure-category">
                <h3>Player</h3>
                <button
                    key="player"
                    className="procedure-item"
                    onClick={() => { setCurrentPage('player'); }}
                >
                    <span className="procedure-name">Open player</span>
                </button>
            </div>

        </div> }
    </>
  );
}
