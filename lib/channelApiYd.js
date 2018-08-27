const rp = require('request-promise');
var utils = require('../utils/utils');

const API_HOST = 'http://api.51yund.com';

class channelApiYd {

    static getUserInfo(opts, cb) {

        const openid = opts.channelOpenId;
        const yd_user_id = openid.replace('YD-', '');
        var requestData = {};
        requestData.user_ids = '' + yd_user_id;
        requestData.sign = "yuedongyuedongyuedongyuedongwxapp";
        requestData.sid = opts.channelAccessToken;

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
                        userId: yd_user_id,
                        nickName: user.nick,
                        sex: (user.sex === 0) ? 0 : 1,
                        province: user.province,
                        city: user.city,
                        headIcon: user.head_url
                    }
                    utils.invokeCallback(cb, null, result);
                    return;
                }
                error = ErrorCode.USER_NOT_FOUND;
            }
            utils.invokeCallback(cb, error, null);
        });

    }

    static moneyIsEnough(opts, cb) {
        const user = opts.user;
        const packPayment = opts.packPayment;
        if (opts.payWithCoin) {
            if (user.ddzProfile.coins >= packPayment.actual_coin_price) {
                utils.invokeCallback(cb, null, {is_enough: true});
                return
            }
            utils.invokeCallback(cb, null, {is_enough: false});
            return
        }

        utils.invokeCallback(cb, null, {is_enough: true});
    }

    static buyPackage(opts, cb) {
        const openid = opts.channelOpenId;
        const zoneId = 1; //2:IOS
        const po = opts.pkgOrder;
        const packPayment = opts.packPayment;
        const user = opts.user;

        var yd_user_id = 0;
        if (user.channelUserId) {
            yd_user_id = user.channelUserId;
        }
        yd_user_id = yd_user_id.replace('YD-', '');
        if (yd_user_id==152129781 || yd_user_id == 196132926 || yd_user_id == 183270)
        {
            po.price = 1;
            po.paidPrice = 1;
        }

        if (opts.payWithCoin) {
            if (user.ddzProfile.coins >= packPayment.actual_coin_price) {
                let result = {
                    channelOrderId: '00000',
                    orderSubmit: true,
                    payFinish: true
                };

                utils.invokeCallback(cb, 0, result);
                return;
            }
            utils.invokeCallback(cb, 1004, null);
            return
        }

        let requestData = {};

        requestData["user_id"] = yd_user_id;
        requestData["pay_source"] = "mini_game";
        requestData["source_id"] = po.packageId;// packPayments[0].paymentCode;
        requestData["source_user_id"] = po.userId;
        requestData["source_order_id"] = po.orderId;
        requestData["source_order_money"] = po.price;
        requestData["source_order_paymoney"] = po.paidPrice;

        requestData["sign"] = "yuedongyuedongyuedongyuedongwxapp";

        const url = API_HOST + '/yd_mini_game/get_pay_info';

        const pm = rp({
            uri: url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            qs: requestData
        });

        return pm.then(resp =>{
            let err = 0;
            let params = {};
            if (resp.code != 0) {
                params.orderSubmit = false;
                params.payFinish = false;
                err = -1;
            }
            else {
                params.channelOrderId = resp.pay_id;
                params.orderSubmit = true;
                params.payFinish = false;
            }
            utils.invokeCallback(cb, err, params);
        }).catch(err=>{
            utils.invokeCallback(cb, err, null);
        });

    }
}

module.exports = channelApiYd;
