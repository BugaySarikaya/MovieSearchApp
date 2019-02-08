
var request = require('request');

describe("Search Movie API", function() {
        it("returns movies", function(done) {
            var options = {
                url: 'http://www.omdbapi.com/?apikey=e05de85&s=Thor',
                headers: {
                    'Content-Type': 'json'
                }
            };
            request.get(options, function (err, res, body) {
                if(body.Search){
                    assert.isAbove(body.Search.length, 0, 'results length is strictly greater than 0');
                    done();
                }else{
                    done();
                }
            });
        });
});
