import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
    try {
        const newUser = await request.json();
        const filePath = path.resolve('src/data/data.json');

        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(data);

        jsonData.push(newUser);

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8');

        return json({ message: 'User added successfully.' });
    } catch (error) {
        console.error('Error adding user:', error);
        return json({ error: 'Failed to add user.' }, { status: 500 });
    }
}