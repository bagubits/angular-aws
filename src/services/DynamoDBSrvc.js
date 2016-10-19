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
