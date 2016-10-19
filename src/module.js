
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
