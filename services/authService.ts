// A simple, non-cryptographically secure hashing function for demonstration purposes.
// In a real application, use a robust library like bcrypt.
const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const USERS_DB_KEY = 'navgurukul_users';
const SESSION_KEY = 'navgurukul_session';

interface User {
    email: string;
    passwordHash: string;
}

const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem(USERS_DB_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Could not parse users from localStorage", error);
        return [];
    }
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

export const signUp = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const users = getUsers();
    const userExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = { email: email.toLowerCase(), passwordHash };
    users.push(newUser);
    saveUsers(users);

    return { success: true, message: 'Account created successfully! Please sign in.' };
};

export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: { email: string } }> => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, message: 'Invalid email or password. Please try again.' };
    }

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
        return { success: false, message: 'Invalid email or password. Please try again.' };
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email }));
    return { success: true, message: 'Login successful!', user: { email: user.email } };
};

export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): { email: string } | null => {
    try {
        const session = localStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    } catch (error) {
        console.error("Could not parse session from localStorage", error);
        return null;
    }
};