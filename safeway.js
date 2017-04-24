// Sample Usage
// /cygdrive/c/PROGRAMMER/phantomjs/bin/phantomjs.exe --ignore-ssl-errors=true --debug=false safeway.js | grep "SCRIPT:"

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

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36';
// page.viewportSize = { width: 480, height: 640 };
//1. authenticate
url = 'https://www.safeway.com/iaaw/service/authenticate';
page.open(url, settings, function(status){
    console.log("SCRIPT: Status: " + status + "; URL: " + page.url);
    if (status === 'success') {
        //save the page as an image
        page.render('auth.png');

        //2. load coupons
        url = 'http://www.safeway.com/ShopStores/Justforu-Coupons.page#/category/all';
        page.open(url, function(status) {
            var isOnline, i, intervalId;

            console.log("SCRIPT: Status: " + status + "; URL: " + page.url);
            // page.render('load.png');
            // console.log("SCRIPT: Loaded");
            if (status === 'success') {
                //Injects external JS into the page
                // if (!page.injectJs('clip.js')){
                //     console.log('FAILURE: could not inject clip.js');
                //     phantom.exit(1);
                // }
                // console.log('SCRIPT: '+page.content);
                for (i = 0; i < 5; i++) {
                    isOnline = page.evaluate(function () {
                        return ($('#j4u-error-body').length === 0);
                    });
                    if (isOnline){
                        console.log('SCRIPT: Page is ready '+i);
                        break;
                    } else {
                        console.log('SCRIPT: Page is offline - attempt: '+i);
                        page.reload();
                    }
                }
                if (!isOnline){
                    errorExit('SCRIPT: Failed to load coupons');
                    return;
                }

                //3. scroll the page to force all coupons to load
                intervalId = window.setInterval(function() {
                    var isScrollComplete, success;

                    console.log('SCRIPT: Run interval '+intervalId);
                    isScrollComplete = page.evaluate(function () {
                        var el = document.body,
                            scrollTop = el.scrollTop,
                            scrollHeight = el.scrollHeight,
                            innerHeight = window.innerHeight;

                        if ((scrollHeight - (innerHeight + scrollTop)) > 0){
                            console.log('SCRIPT: Scrolling page from '+(scrollTop+innerHeight)+' to '+scrollHeight);
                            //do NOT scroll by a large amount or the events may not trigger
                            el.scrollTop += 100;
                            //window.scrollTo(0, scrollHeight);

                            //as long as we are scrolling, we are not done
                            return false;
                        }
                        //reached the bottom
                        console.log('SCRIPT: Scrolling complete ');
                        return true;
                    });

                    if (isScrollComplete){
                        window.clearInterval(intervalId);
                        console.log('SCRIPT: Cleared interval '+intervalId);
                        page.render('scroll.png');

                        //4. clip all available coupons
                        success = page.evaluate(function() {
                            var coupons = $("div.lt-offer-Clip.ng-scope");
                            console.log('SCRIPT: Found '+coupons.length+' coupons');
                            if (coupons.length > 0) {
                                coupons.each(function (i) {
                                    var coupon = $(this);
                                    console.log('SCRIPT: Clipping (' + i + ') ' + coupon.parent('div.lt-offer-not-added').find('.lt-coupon-ccpd-title').text());
                                    coupon.click();
                                    console.log('SCRIPT: Clipped '+i);
                                });
                            } else {
                                //didn't find anymore coupons - assume done
                            }
                            return true;
                        });

                        console.log('SCRIPT: waiting 1 minute for ajax requests to complete ');
                        //must pause to let the ajax requests get sent for all coupons
                        window.setTimeout(function() {
                            page.render('coupon.png');
                            page.close();
                            phantom.exit(0);
                        }, 60000);
                    }
                }, 1000);

            } else {
                errorExit('SCRIPT: FAILURE: could not open coupon page');
            }
        });
    } else {
        errorExit('SCRIPT: FAILURE: could not authenticate');
    }
});

//evaluate runs in a sandbox so we don't get the console.log msgs w/o listening to msg
page.onConsoleMessage = function(msg) {
    var dt = new Date().getTime();
    console.log("(" + dt + ") " + msg);
};

function errorExit(msg){
    console.log(msg);
    page.close();
    phantom.exit(1);
}