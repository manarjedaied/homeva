import { jwtDecode } from "jwt-decode";

const Auth = {
    setSession(accessToken: string, refreshToken: string) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
    },

    clear() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    },

    getToken() {
        return localStorage.getItem("accessToken");
    },

    getRefresh() {
        return localStorage.getItem("refreshToken");
    },

    getUser() {
        const token = this.getToken();
        if (!token) return null;

        try {
            return jwtDecode(token); // { email, role, id, exp }
        } catch (err) {
            return null;
        }
    },

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<{ exp: number }>(token);
            return decoded.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
};

export default Auth;
