const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path.replace('/.netlify/functions/api/', '');
    const method = event.httpMethod;

    try {
        // GET /api/registrations - Fetch all
        if (path === 'registrations' && method === 'GET') {
            const rows = await sql`SELECT * FROM registrations ORDER BY registeredAt DESC`;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(rows)
            };
        }

        // POST /api/registrations - Create new
        if (path === 'registrations' && method === 'POST') {
            const data = JSON.parse(event.body);
            await sql`
                INSERT INTO registrations 
                (id, name, email, phone, adults, kids516, kidsU5, attendees, totalPeople, totalAmount, checkedIn)
                VALUES (
                    ${data.id}, 
                    ${data.name}, 
                    ${data.email}, 
                    ${data.phone}, 
                    ${data.adults}, 
                    ${data.kids516}, 
                    ${data.kidsU5}, 
                    ${JSON.stringify(data.attendees)}, 
                    ${data.totalPeople}, 
                    ${data.totalAmount}, 
                    false
                )
            `;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        // PATCH /api/registrations/:id - Update check-in
        if (path.startsWith('registrations/') && method === 'PATCH') {
            const id = path.split('/')[1];
            const data = JSON.parse(event.body);
            await sql`
                UPDATE registrations 
                SET checkedIn = ${data.checkedIn}, 
                    checkedInAt = ${data.checkedInAt}
                WHERE id = ${id}
            `;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true })
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not Found' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
