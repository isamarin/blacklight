import { getSessionStorage } from "./localstorage";

export function getWebToken() {
    const webToken = getSessionStorage('auth_web_token') ?? undefined;

    let uhs = '';
    let token = ''
    
    if(webToken !== undefined) {
        const parsedToken = JSON.parse(webToken);
        uhs = parsedToken.DisplayClaims.xui[0].uhs;
        token = parsedToken.Token;
    }

    return { uhs: uhs, token: token}
}