import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const usersFilePath = path.resolve('src/data/users.json');
const sessionsFilePath = path.resolve('src/data/sessions.json');

async function getUsers() {
    if (!fs.existsSync(usersFilePath)) {
        return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}

async function getSessions() {
    if (!fs.existsSync(sessionsFilePath)) {
        return {};
    }
    const data = fs.readFileSync(sessionsFilePath, 'utf-8');
    return JSON.parse(data);
}

async function saveSession(sessionId, email) {
    const sessions = await getSessions();
    // sessions[sessionId] = { email, expires: Date.now() + 1000 * 30 }; // Session expires in 30 sec // not working here, have this funtionality on client side in +page.svelte
    fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2), 'utf-8');
}

export async function POST({ request }) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const users = await getUsers();
        const user = users.find(user => user.email === email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return json({ error: 'Invalid email or password.' }, { status: 400 });
        }

        const sessionId = uuidv4();
        await saveSession(sessionId, email);

        return json({ sessionId });
    } catch (error) {
        console.error('Error during login:', error);
        return json({ error: 'Login failed.' }, { status: 500 });
    }
}
