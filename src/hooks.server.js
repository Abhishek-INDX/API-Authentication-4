// import fs from 'fs';
// import path from 'path';

// const sessionsFilePath = path.resolve('src/data/sessions.json');

// async function getSessions() {
//     if (!fs.existsSync(sessionsFilePath)) {
//         return {};
//     }
//     const data = fs.readFileSync(sessionsFilePath, 'utf-8');
//     return JSON.parse(data);
// }

// export async function handle({ event, resolve }) {
//     const sessionId = event.request.headers.get('cookie')?.split('=')[1] || '';
//     const sessions = await getSessions();
//     const session = sessions[sessionId];

//     if (session && session.expires > Date.now()) {
//         event.locals.user = session.email;
//     } else {
//         event.locals.user = null;
//     }

//     return resolve(event);
// }
