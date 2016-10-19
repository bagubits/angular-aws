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
