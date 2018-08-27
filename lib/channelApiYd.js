const rp = require('request-promise');

const API_HOST = 'http://api.51yund.com';

class channelApiYd {

    static getUserInfo(opts, cb) {

        const yd_user_id = opts.user_id;
        var requestData = {};
        requestData.user_ids = '' + yd_user_id;
        requestData.sign = "yuedongyuedongyuedongyuedongwxapp";
        requestData.sid = opts.sid;

        const url = API_HOST+'/sport/get_user_info';

        const pm = rp({
            uri: url,
            method: "POST",
            json: true,
            gzip: true,
            headers: {
                "content-type": "application/json",
            },
            qs: requestData
        });

        pm.then(resp => {
            let error = 0;
            if (resp.code != 0) {
                error = resp.code;
            }
            else {
                const users = resp.info;
                if (resp.cnt == 1) {
                    var user = users[0];

                    const result = {
                        channelId: 1000,
                        id: yd_user_id,
                        displayName: user.nick,
                        sex: (user.sex === 0) ? 0 : 1,
                        province: user.province,
                        city: user.city,
                        picture: user.head_url,
                        accessToken: opts.sid,
                    }
                    cb(null, result);
                    return;
                }
                error = -1;
            }
            cb(error, null);
        });

    }
}

module.exports = channelApiYd;
