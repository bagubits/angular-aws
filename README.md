# angular-aws
Angular AWS login and services integration

## Install

Include require files

```hmtl
<script src="dist/angular-aws-lib.js"></script>
<script src="dist/angular-aws.min.js"></script>
```

Load module in your angular app

```
var yourApp = angular.module('yourApp', ['angular-aws']);
```

## Configure

configure $AWSProvider in your app.config

```
yourApp.config(function($AWSProvider) {

	$AWSProvider.cognitoLoginId = ''; //cognito login id
	$AWSProvider.identityPoolId = ''; //go to AWS Cognito Federated Identites
	$AWSProvider.userAttributes = ['email', 'phone_number' ]; //the standard attributes you require in AWS Cognito
	$AWSProvider.MFARequired = false; //do you require your clients to use MFA?

});
```

## Services

Cognito

```
$scope.initCognito = function(){
    Cognito.initialize($scope.user, $scope.pass, [{Name:"email", Value:$scope.email},{Name:"phone_number",Value:$scope.tel}]);
};

$scope.register = function(){
    Cognito.register($scope.user,$scope.pass,[{Name:"email", Value:$scope.email},{Name:"phone_number",Value:$scope.tel}],
        function(success,data){
            if(success) console.log(data);
            else console.error(data);
        }
    );
};

$scope.authenticate = function(){
    Cognito.authenticate($scope.user, $scope.pass,
        function(success,data){
            if(success){
                console.log(data);
            }else{
                console.error(data);
            }
    });
};

$scope.attributes = function(e){
    Cognito.getUserAttributes(function(success,data){
        console.log(data);
    });
};

$scope.exit = function(e){
    Cognito.signOut();
}
$scope.read = function(e){
    Cognito.getSession();
}
```

DynamoDB

```
$scope.read = function(){
    var readparams = {
      Key: {
        id: {S: 'f95217c0-8ca8-11e6-9bff-b3956a3b4954'}
      },
      AttributesToGet: ['name'],
      TableName: 'testtable'
    };
    DynamoDB.read(readparams, function(success,data){
        if(success) console.log(data);
        else console.error(data);
    });
}

$scope.write = function(){
    var data = {
        "id": DynamoDB.getguid(),
        "name":$scope.name,
        "year":$scope.year,
        "value":$scope.value,
        "values":$scope.values,
        "data": new Date().toLocaleString()
    }
    DynamoDB.write("testtable", data, function(success,data){
        if(success) console.log(data);
        else console.error(data);
    });
}

$scope.find = function(){

    var params = {
        TableName : "testtable",
        ProjectionExpression: "#yr,#id,#name,#value",
        FilterExpression: "#yr = :yyyy",
        ExpressionAttributeNames: {
            "#yr": "year",
            "#id": "id",
            "#name": "name",
            "#value": "value"
        },
        ExpressionAttributeValues: {
             ":yyyy": "2015"
        }
    };

    function onScan(err, data) {
        if (err) {
                console.error("Unable to query" + err);
        } else {
                console.log("Query succeeded.");
                console.log(data);
                if (typeof data.LastEvaluatedKey != "undefined") {
                        console.log("Scanning for more...");
                        params.ExclusiveStartKey = data.LastEvaluatedKey;
                        DynamoDB.scan(params, onScan);
                }
        }
    }

    DynamoDB.scan(params, onScan);
}
```

S3

```
$scope.upload = function(e){
    var fileChooser = document.getElementById('file-chooser');
    var button = document.getElementById('upload-button');
    var results = document.getElementById('results');

    var file = fileChooser.files[0];

    if (file) {
        results.innerHTML = '';
        var filename = file.name;

        S3.upload('test-bucket', filename, file, function(status){
            results.innerHTML = !status ? 'ERROR!' : 'UPLOADED.';
        });

    } else {
      results.innerHTML = 'Nothing to upload.';
    }
}
```
