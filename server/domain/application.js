var etcd = require('../etcd'),
    _ = require('underscore'),
    config = require('./../../config/config.json'),
    acl = require('./../acl'),
    audit = require('./../audit'),
    etcdBaseUrl = "http://" + config.etcdHost + ":" + config.etcdPort + '/v2/keys/';

module.exports = {
    getApplications: function(cb){
        etcd.client.get('v1/toggles/', {recursive: false}, function(err, result){
            if (err) {
                if (err.errorCode == 100) { // key not found
                    return cb(null, []);
                } else {
                    return cb(err);
                }
            }

            var applications = _.map(result.node.nodes || [], function(node)
                {
                    var splitKey = node.key.split('/');
                    return splitKey[splitKey.length - 1];
                });
            cb(null, applications);
        });
    },

    addApplication: function(applicationName, req, cb){
        var path = 'v1/toggles/' + applicationName;
        etcd.client.mkdir(path, function(err){
            if (err) {
                return cb(err);
            }

            audit.addApplicationAudit(req, applicationName, 'Created', function(){
               if (err){
                   console.log(err); // todo: better logging
               }
            });

            // todo: not sure if this is correct
            if (config.RequiresAuth) {
                var userEmail = req.user._json.email; // todo: need better user management
                acl.grant(userEmail, applicationName, function (err) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb();
                });
            } else {
                cb();
            }
        });
    },

    getApplicationMetaData: function(applicationName, cb){
        etcd.client.get('v1/metadata/' + applicationName , {recursive: true}, function(err, result){
            if (err) {
                if (err.errorCode == 100) { // key not found
                    cb(null, {});
                } else {
                    cb(err);
                }
                return;
            }
            var metaDataKeyValues = _.map(result.node.nodes, function(subNode){
                var metaDataKey = _.last(subNode.key.split('/'));
                return [metaDataKey, subNode.value];
            });
            cb(null, _.object(metaDataKeyValues));
        });
    },

    saveApplicationMetaData: function(applicationName, metaDataKey, metaDataValue, cb){
        var path = 'v1/metadata/' + applicationName + '/' + metaDataKey;
        etcd.client.set(path, metaDataValue, function(err){
            return cb(err);
        });
    }
};
