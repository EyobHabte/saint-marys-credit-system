// src/utils/auth.js
export const decodeToken = (token) => {
    if (!token || !token.split || token.split('.').length !== 3) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) return null; // Expired token
        return payload;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

export const getRoleFromToken = () => {
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token);
    return decoded?.role || null;
};