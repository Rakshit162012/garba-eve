const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path
    .replace(/^\/api\/?/, '')
    .replace(/^\/\.netlify\/functions\/api\/?/, '');

  const method = event.httpMethod;

  try {
    // GET /api/registrations
    if (path === 'registrations' && method === 'GET') {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('registeredat', { ascending: false });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    // POST /api/registrations
    if (path === 'registrations' && method === 'POST') {
      const data = JSON.parse(event.body);

      const row = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        adults: data.adults || 0,
        kids516: data.kids516 || 0,
        kidsu5: data.kidsU5 || 0,
        attendees: data.attendees || [],
        totalpeople: data.totalPeople || 0,
        totalamount: data.totalAmount || 0,
        registeredat: data.registeredAt || new Date().toISOString(),
        checkedin: false,
        checkedinat: null
      };

      const { error } = await supabase
        .from('registrations')
        .insert(row);

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    // PATCH /api/registrations/:id
    if (path.startsWith('registrations/') && method === 'PATCH') {
      const id = decodeURIComponent(path.split('/')[1]);
      const data = JSON.parse(event.body);

      const { error } = await supabase
        .from('registrations')
        .update({
          checkedin: data.checkedIn,
          checkedinat: data.checkedInAt
        })
        .eq('id', id);

      if (error) throw error;

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
