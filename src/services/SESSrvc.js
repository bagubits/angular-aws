angularAWS.service('SES', ['$AWS', function($AWS) {

    this.sendEmail = function(recipient, object, msg, cb) {
        var ses = new AWS.SES();

        var params = {
          Destination: {
            ToAddresses: [recipient]
          },
          Message: {
            Body: {
              Text: {
                Data: msg,
                Charset: 'utf8'
              }
            },
            Subject: {
              Data: object,
              Charset: 'utf8'
            }
          },
          Source: $AWS.SESSource,
        };

        ses.sendEmail(params, function(err, data) {
          if (err) cb(false, err.stack);
          else     cb(true);
        });
    }

}]);
