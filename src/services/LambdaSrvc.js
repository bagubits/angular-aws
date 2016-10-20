angularAWS.service('Lambda', function() {

    this.invoke = function(functionname, cb, data) {
        var lambda = new AWS.Lambda();

        var params = {
          FunctionName: functionname,
          LogType: 'Tail',
          Payload: JSON.stringify(data)
        };

        lambda.invoke(params, function(err, data) {
          if (err) cb(false, err);
          else     cb(true, data);
        });
    }

});
