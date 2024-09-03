import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';


const usersFilePath = path.resolve('src/data/users.json');

async function getUsers() {
    if (!fs.existsSync(usersFilePath)) {
        return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}

export async function POST({ request }) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const users = await getUsers();
        if (users.find(user => user.email === email)) {
            return json({ error: 'User already exists.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ email, password: hashedPassword });
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');

        return json({ message: 'Signup successful.' });
    } catch (error) {
        console.error('Error during signup:', error);
        return json({ error: 'Signup failed.' }, { status: 500 });
    }
}
