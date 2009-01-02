var longurlplease = {
  // At the moment clients must maintain a list of services which they will attempt to lengthen short urls for
  shortUrlsPattern : new RegExp("^http(s?)://(bit\\.ly|cli\\.gs|dwarfurl\\.com|ff\\.im|idek\\.net|is\\.gd|korta\\.nu|ln-s\\.net|loopt\\.us|moourl\\.com|ping\\.fm|piurl\\.com|poprl\\.com|reallytinyurl\\.com|rubyurl\\.com|short\\.ie|smallr\\.com|snipr\\.com|snipurl\\.com|snurl\\.com|tinyurl\\.com|tr\\.im|twurl\\.nl|u\\.mavrev.com|ur1\\.ca|url\\.ie|urlx\\.ie|xrl\\.us|yep\\.it|zi\\.ma|zurl\\.ws)/.*"),
  numberOfUrlsPerBatch : 4,
  lengthen : function(options) {
    if (typeof(options) == 'undefined')
      options = {}
    var parent = document;

    var makeRequest = function() {
      alert('not sure how to call api');
    };
    if (options.transport.toLowerCase() == 'air')
      makeRequest = longurlplease.makeRequestWithAir;
    else if (options.transport.toLowerCase() == 'flxhr')
      makeRequest = longurlplease.makeRequestWithFlxhr;
    else if (options.transport.toLowerCase() == 'jquery')
      makeRequest = longurlplease.makeRequestWithJQuery;

    var urlToElements = options.urlToElements;
    var toLengthen = options.toLengthen;
    if (toLengthen == null || urlToElements == null) {
      urlToElements = {}
      toLengthen = []
      var els = parent.getElementsByTagName('a');
      for (var elIndex = 0; elIndex < els.length; elIndex++) {
        var el = els[elIndex];
        if (longurlplease.shortUrlsPattern.test(el.href)) {
          toLengthen.push(el.href);
          var listOfElements = urlToElements[el.href];
          if (listOfElements == null)
            listOfElements = []
          listOfElements.push(el);
          urlToElements[el.href] = listOfElements;
        }
      }
    }
    var lengthenShortUrl = function(a, longUrl) {
      // You can customize this - my intention here is to alter the visible text to use as much of the long url
      // as possible, but maintain the same number of characters to help keep visual consistancy.
      if (a.href == a.innerHTML) {
        var linkText = longUrl.replace(/^http(s?):\/\//, '').replace(/^www\./, '');
        a.innerHTML = linkText.substring(0, a.innerHTML.length - 3) + '...';
      }
      a.href = longUrl;
      if(options.afterLengthen !=null)
        options.afterLengthen(a,longUrl);
    };
    if (options.lengthenShortUrl != null)
      lengthenShortUrl = options.lengthenShortUrl
    var handleResponseEntry = function(shortUrl, longUrl) {
      var aTags = urlToElements[shortUrl];
      for (var ai = 0; ai < aTags.length; ai++)
        lengthenShortUrl(aTags[ai], longUrl);
    };
    var subArray, i = 0;
    while (i < toLengthen.length) {
      subArray = toLengthen.slice(i, i + longurlplease.numberOfUrlsPerBatch)
      var paramString = longurlplease.toParamString(subArray);
      makeRequest(paramString, handleResponseEntry);
      i = i + longurlplease.numberOfUrlsPerBatch;
    }
  },
  toParamString : function(shortUrls) {
    var paramString = "";
    for (var j = 0; j < shortUrls.length; j++) {
      var href = shortUrls[j];
      paramString += "q=";
      paramString += encodeURI(href);
      if (j < shortUrls.length - 1)
        paramString += '&'
    }
    return paramString;
  },
  apiUrl : function() {
    return (("https:" == document.location.protocol) ? "https" : "http") + "://longurlplease.appspot.com/api/v1.1";
  },
  makeRequestWithAir : function(paramString, callback) {
    var loader = new air.URLLoader();
    loader.addEventListener(air.Event.COMPLETE, function (event) {
      JSON.parse(event.target.data, function (key, val) {
        if (typeof val === 'string' && val != null)
          callback(key, val);
      });
    });
    var request = new air.URLRequest(longurlplease.apiUrl() + "?ua=air&" + paramString);
    loader.load(request);
  },
  makeRequestWithFlxhr : function(paramString, callback) {
    var flproxy = new flensed.flXHR({ autoUpdatePlayer:true, xmlResponseText:false, onreadystatechange:function (XHRobj) {
      if (XHRobj.readyState == 4)
        JSON.parse(XHRobj.responseText, function (key, val) {
          if (typeof val === 'string' && val != null)
            callback(key, val);
        });
    }});
    flproxy.open("GET", longurlplease.apiUrl());
    flproxy.send("ua=flxhr&" + paramString);
  },
  makeRequestWithJQuery : function(paramString, callback) {
    jQuery.getJSON(longurlplease.apiUrl() + "?ua=jquery&" + paramString + "&callback=?",
            function(data) {
              jQuery.each(data, function(key, val) {
                if (val != null)
                  callback(key, val);
              });
            });
  }
};

if (typeof(jQuery) != 'undefined') {
  jQuery.longurlplease = function(options) {
    jQuery('body').longurlplease(options)
  };
  jQuery.fn.longurlplease = function(options) {
    if (typeof(options) == 'undefined')
      options = {}
    options.transport = 'jquery';
    var toLengthen = [];
    var urlToElements = {};
    this.find('a').filter(function() {
      return this.href.match(longurlplease.shortUrlsPattern)
    }).each(function() {
      toLengthen.push(this.href);
      var listOfElements = urlToElements[this.href];
      if (listOfElements == null)
        listOfElements = []
      listOfElements.push(this);
      urlToElements[this.href] = listOfElements;
    });
    options.toLengthen = toLengthen;
    options.urlToElements = urlToElements;
    longurlplease.lengthen(options);
    return this;
  };
}