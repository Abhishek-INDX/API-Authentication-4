import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';


const sessionsFilePath = path.resolve('src/data/sessions.json');

async function getSessions() {
    if (!fs.existsSync(sessionsFilePath)) {
        return {};
    }
    const data = fs.readFileSync(sessionsFilePath, 'utf-8');
    return JSON.parse(data);
}

async function deleteSession(sessionId) {
    const sessions = await getSessions();
    delete sessions[sessionId];
    fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2), 'utf-8');
}

export async function POST({ request }) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return json({ error: 'Session ID is required.' }, { status: 400 });
        }

        await deleteSession(sessionId);

        return json({ message: 'Logged out successfully.' });
    } catch (error) {
        console.error('Error during logout:', error);
        return json({ error: 'Logout failed.' }, { status: 500 });
    }
}

