const https = require('https');
const options = {
    hostname: 'puvbvkvugtxilwitfoiw.supabase.co',
    path: '/rest/v1/',
    method: 'GET',
    headers: {
        'apikey': 'sb_publishable_kiOdb3am0u0CBVBG-lP2cg_8vvVlf0h'
    }
};
const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(Object.keys(json.definitions).join('\n'));
        } catch (e) {
            console.error(e);
            console.log(data.substring(0, 500));
        }
    });
});
req.end();
