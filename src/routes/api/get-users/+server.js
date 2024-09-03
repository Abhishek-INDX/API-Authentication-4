import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.resolve('src/data/data.json');

        if (!fs.existsSync(filePath)) {
            return json([]);
        }

        const data = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(data);

        return json(jsonData);
    } catch (error) {
        console.error('Error fetching users:', error);
        return json({ error: 'Failed to fetch users.' }, { status: 500 });
    }
}
