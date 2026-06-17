export const getToken = (): string | null => localStorage.getItem('token');
export const getUserRole = (): string | null => localStorage.getItem('role');
export const getUserName = (): string | null => localStorage.getItem('fullName');

// Hàm giải mã JWT để lấy GUID thật của User trong Database
export const getUserId = (): string | null => {
    const token = getToken();
    if (!token) return null;
    try {
        // Cắt lấy phần Payload của Token và giải mã Base64
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.Id; // Khớp với Claim("Id") trong C#
    } catch (e) {
        return null;
    }
};

export const logout = (): void => {
    localStorage.clear();
    window.location.href = '/'; 
};