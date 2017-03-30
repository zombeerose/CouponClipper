// Sample Usage
// phantomjs.exe --ignore-ssl-errors=true --debug=false safeway.js

var page = require('webpage').create();
var url;
var settings = {
    operation: 'POST',
    encoding: 'utf8',
    headers: {
        'Content-Type': 'application/json'
    },
    data: JSON.stringify({
        "userId":"USERNAME",
        "password":"PASSWORD",
        "source":"WEB",
        "rememberMe":false
    })
};

//1. authenticate
url = 'https://www.safeway.com/iaaw/service/authenticate';
page.open(url, settings, function(status){
    console.log("Status: " + status + "; URL: " + page.url);
    if (status === 'success') {
        //save the page as an image
        page.render('auth.png');

        //2. load coupons
        url = 'http://www.safeway.com/ShopStores/Justforu-Coupons.page';
        page.open(url, function(status) {
            console.log("Status: " + status + "; URL: " + page.url);
            if (status === 'success') {
                //Injects external JS into the page
                // if (!page.injectJs('clip.js')){
                //     console.log('FAILURE: could not inject clip.js');
                //     phantom.exit(1);
                // }

                //3. scroll the page to force all coupons to load
                var intervalId = setInterval(function() {
                    console.log('Interval '+intervalId);
                    var result = page.evaluate(function () {
                        var bottom = document.body.scrollHeight,
                            current = window.innerHeight + document.body.scrollTop;
                        if ((bottom - current) > 0) {
                            console.log('Scrolling page '+bottom);
                            window.scrollTo(0, bottom);
                            return false;
                        }
                        //reached the bottom
                        return true;
                    });

                    if (result){
                        clearInterval(intervalId);
                        page.render('scroll.png');

                        //4. clip all available coupons
                        var success = page.evaluate(function() {
                            var coupons = $("div.lt-offer-Clip.ng-scope");
                            console.log('Found '+coupons.length+' coupons');
                            if (coupons.length > 0) {
                                coupons.each(function (i) {
                                    var coupon = $(this);
                                    console.log('Clipping (' + i + ') ' + coupon.parent('div.lt-offer-not-added').find('.lt-coupon-ccpd-title').text());
                                    coupon.click();
                                    console.log('Clipped '+i);
                                });
                            } else {
                                //didn't find anymore coupons - assume done
                                return true;
                            }

                        });

                        //must pause to let the ajax requests get sent for all coupons
                        setTimeout(function() {
                            page.render('coupon.png');
                            phantom.exit(success ? 0 : 1);
                        }, 60000);
                    }
                }, 5000);

            } else {
                console.log('FAILURE: could not open coupon page');
                phantom.exit(1);
            }
        });
    } else {
        console.log('FAILURE: could not authenticate');
        phantom.exit(1);
    }
});

//evaluate runs in a sandbox so we don't get the console.log msgs w/o listening to msg
page.onConsoleMessage = function(msg) {
    console.log(msg);
};