const BeamClient = require('beam-client-node');
const BeamSocket = require('beam-client-node/lib/ws');

let userInfo;

const client = new BeamClient();

// With OAuth we don't need to login, the OAuth Provider will attach
// the required information to all of our requests after this call.
client.use('oauth', {
    tokens: {
        access: 'U2jf9cRIQFm1iGUb8uXv3W9G0FVjme3oVNelxl7CROZ2HA4fXoWcqUpxEQBF8nKz',
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
    },
});

// Get's the user we have access to with the token
client.request('GET', `users/current`)
    .then(response => {
        userInfo = response.body;
        return client.chat.join(response.body.channel.id);
    })
    .then(response => {
        const body = response.body;
        return createChatSocket(userInfo.id, userInfo.channel.id, body.endpoints, body.authkey);
    })
    .catch(error => {
        console.log('Something went wrong:', error);
    });

/**
 * Creates a beam chat socket and sets up listeners to various chat events.
 * @param {any} userId The user to authenticate as
 * @param {any} channelId The channel id to join
 * @param {any} endpoints An endpoints array from a beam.chat.join call.
 * @param {any} authkey An authentication key from a beam.chat.join call.
 * @returns {Promise.<>}
 */
function createChatSocket(userId, channelId, endpoints, authkey) {
    // Chat connection
    const socket = new BeamSocket(endpoints).boot();

    // React to our !pong command
    socket.on('ChatMessage', data => {
        if (data.message.message[0].data.toLowerCase().startsWith('!ping')) {
            socket.call('msg', [`@${data.user_name} PONG!`]);
            console.log(`Ponged ${data.user_name}`);
        } else if (data.message.message[0].data.toLowerCase().startsWith('!gt')) {
            socket.call('msg', ['My gamertag is currently Sygma Salamanda. Add me if you want...']);
            console.log('Announced Gamertag');
        } else if (data.message.message[0].data.toLowerCase().startsWith('!yt')) {
            socket.call('msg', ['I post a lot of random videos on my youtube channel. Check it out if you want at https://www.youtube.com/user/luculentsea16']);
            console.log('Announced Youtube');
        }else if (data.message.message[0].data.toLowerCase().startsWith('!discord')) {
            socket.call('msg', ['If you want to talk to me off stream or you just want somewhere to chill join my discord: https://discord.gg/824Btgy'])
            console.log('Announced banterous discord message');
        }else if (data.message.message[0].data.toLowerCase().startsWith('!wanderer')) {
            socket.call('msg', ['A friend of mine. A... different kind of person. Challenge: figure out the secret. http://beam.pro/thewanderer117']);
            console.log('Wanderer advertisement. Happy now?');
        }else if (data.message.message[0].data.toLowerCase().startsWith('!bot')) {
            socket.call('msg', ['I programmed this bot myself. If you want a bot just ask and I can make one for you. The best way is to fill out the form but you can just get in touch with me through beam :) https://goo.gl/forms/TaB4lXF2tbHhQTVp2']);
            console.log('');
        }else if (data.message.message[0].data.toLowerCase().startsWith('!')) {
            socket.call('msg', ['']);
            console.log('');
        }
    });

    // Handle errors
    socket.on('error', error => {
        console.error('Socket error', error);
    });

    return socket.auth(channelId, userId, authkey)
        .then(() => {
            console.log('Login successful');
            return socket.call('msg', ['Hi! I\'m pingbot! Write !ping and I will pong back!']);
        });
}
