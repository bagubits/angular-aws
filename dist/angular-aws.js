
var angularAWS = angular.module('angular-aws', []);

angularAWS.provider("$AWS", [function() {

    this.MFARequired = false;
    this.poolData = null;
    this.identityPoolId = null;
    this.cognitoLoginId = null;
    this.userAttributes = null;
    this.region = null;

    this.setRegion = function(region){
        this.region = region;
        AWSCognito.config.region = 'us-east-1'; //This is required to derive the endpoint
        AWS.config.region = 'us-east-1';
    }

    this.$get = [function() {
        return {
            "MFARequired": this.MFARequired,
            "poolData": this.poolData,
            "identityPoolId": this.identityPoolId,
            "cognitoLoginId": this.cognitoLoginId,
            "userAttributes": this.userAttributes,
            "setRegion": this.setRegion,
        };
    }];

}]);


angularAWS.service('Cognito', ['$AWS', function($AWS) {

    this.cognitoUser = null;
    this.userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool($AWS.poolData);
    this.cognitoUserdata = {
        name: "",
        pass: "",
        attributelist: Array()
    };
    this.cognitoAttributeList = Array();

    this.initialize = function(userName, userPassword, attributeList) {
        this.cognitoUserdata.name = userName;
        this.cognitoUserdata.pass = userPassword;
        this.cognitoUserdata.attributelist = attributeList;
    }

    this.register = function(userName, userPassword, attributeList, cb) {
        angular.forEach(attributeList, function(value, key) {
            var userAttribute = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(value);
            this.cognitoAttributeList.push(userAttribute);
        });
        this.cognitoUserdata.name = userName;
        this.cognitoUserdata.pass = userPassword;
        this.cognitoUserdata.attributelist = this.cognitoAttributeList;
        this.userPool.signUp(userName, userPassword, cognitoAttributeList, null, function(err, result) {
            if (!err) {
                this.cognitoUser = result.user;
                return cb(true, this.cognitoUser);
            } else {
                return cb(false, err);
            }
        });
    };

    this.validate = function(confirmationCode, userName, cb) {
        if (!this.cognitoUser) this.cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
            Username: userName,
            Pool: this.userPool
        });
        this.cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
            if (!err) {
                return cb(true, result);
            } else {
                return cb(false, err);
            }
        });
    }

    this.authenticate = function(userName, userPassword, cb) {
        if (!this.cognitoUser) this.cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
            Username: userName,
            Pool: this.userPool
        });
        var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails({
            Username: userName,
            Password: userPassword
        });

        this.cognitoUserdata.name = userName;
        this.cognitoUserdata.pass = userPassword;

        this.cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function(result) {
                var Logins = {};
                Logins[$AWS.cognitoLoginId] = result.getIdToken().getJwtToken();
                AWS.config.region = AWSCognito.config.region;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: $AWS.identityPoolId,
                    region: AWSCognito.config.region,
                    Logins: Logins
                });

                cb(true, result);
            },
            mfaRequired: function(session) {
                cb(false, 'Confirmation required', session)
            },
            onFailure: function(err) {
                cb(false, err)
            }
        });
    };

    this.signOut = function() {
        if (this.cognitoUser) return this.cognitoUser.globalSignOut();
        else return null;
    }

    this.getSession = function(a, cb) {
        var cognitoUser = this.userPool.getCurrentUser();
        if (cognitoUser != null) {
            this.cognitoUser.getSession(function(err, result) {
                if (result) {

                    var Logins = {};
                    Logins[$AWS.cognitoLoginId] = result.getIdToken().getJwtToken();
                    AWS.config.region = AWSCognito.config.region;
                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: $AWS.identityPoolId,
                        region: AWSCognito.config.region,
                        Logins: Logins
                    });

                    AWS.config.credentials.get(function(err) {
                        if (err) console.error(err);
                        else {
                            AWS.config.update({
                                accessKeyId: AWS.config.credentials.accessKeyId,
                                secretAccessKey: AWS.config.credentials.secretAccessKey
                            });

                            if(cb) cb(AWS.config.credentials);
                        }
                    });
                }
            });
        }
    }


    this.getUserAttributes = function(cb) {
        this.cognitoUser.getUserAttributes(function(err, result) {
            if (err) cb(false, err);
            else cb(true, result);
        });
    }

}]);

angularAWS.service('DynamoDB', function() {

    this.db = null;

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    this.read = function(data, cb) {
        if (!this.db) this.db = new AWS.DynamoDB();
        this.db.getItem(data, function(err, data) {
            if (!err) {
                return cb(true, data);
            } else {
                return cb(false, err);
            }
        });
    }

    this.getguid = function() {
        return guid();
    }

    this.write = function(table, data, cb) {
        if (!this.db) this.db = new AWS.DynamoDB();

        var datawrapped = DynamoDbDataTypes.AttributeValue.wrap(data);
        var elem = {
            TableName: table,
            Item: datawrapped
        };
        this.db.putItem(elem, function(err, data) {
            if (!err) {
                return cb(true, data);
            } else {
                return cb(false, err);
            }
        });
    }

    this.scan = function(params, cb) {
        if (!this.db) this.db = new AWS.DynamoDB();

        var docClient = this.db.DocumentClient();

        docClient.scan(params, cb);
    }

});

angularAWS.service('S3', function() {

    this.upload = function(bucket, key, file, cb) {
        var bucket = new AWS.S3({
            params: {
                Bucket: bucket
            }
        });

        var params = {
            Key: key,
            ContentType: file.type,
            Body: file
        };
        bucket.upload(params, function(err, data) {
            if (err) cb(false);
            else cb(true, data);
        });
    }

});
