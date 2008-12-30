var longurlplease = {
  // At the moment clients must maintain a list of services which they will attempt to lengthen short urls for
  shortUrlsPattern : new RegExp("^http(s?)://(adjix\\.com|bit\\.ly|dwarfurl\\.com|ff\\.im|idek\\.net|is\\.gd|ln-s\\.net|loopt\\.us|ping\\.fm|piurl\\.com|piurl\\.com|poprl\\.com|qlnk\\.net|reallytinyurl\\.com|rubyurl\\.com|short\\.ie|smallr\\.com|snipr\\.com|snipurl\\.com|snurl\\.com|tinyurl\\.com|tr\\.im|twurl\\.nl|ub0\\.cc|ur1\\.ca|url\\.ie|urlx\\.ie|xrl\\.us|yep\\.it|zi\\.ma|zurl\\.ws)/.*"),
  numberOfUrlsPerBatch : 4,
  urlToElement : {},
  lengthen : function(element) {
    var parent = (element == null) ? document : element ;
    var toLengthen = [];
    var els = parent.getElementsByTagName('a');
    for (var elIndex = 0; elIndex < els.length; elIndex++) {
      var el = els[elIndex];
      if (longurlplease.shortUrlsPattern.test(el.href)) {
        toLengthen.push(el.href);
        var listOfElements = longurlplease.urlToElement[el.href];
        if (listOfElements == null)
          listOfElements = []
        listOfElements.push(el);
        longurlplease.urlToElement[el.href] = listOfElements;
      }
    }
    var subArray, i = 0;
    while (i < toLengthen.length) {
      subArray = toLengthen.slice(i, i + longurlplease.numberOfUrlsPerBatch)
      var paramString = longurlplease.toParamString(subArray);
      longurlplease.makeRequest(paramString);
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
  makeRequest : function(paramString) {
    var loader = new air.URLLoader();
    loader.addEventListener(air.Event.COMPLETE,
            function (event) {
              longurlplease.handleJsonResponse(event.target.data);
            });
    var request = new air.URLRequest("http://www.longurlplease.com/api/v1.1?ua=air&" + paramString);
    loader.load(request);
  },
  handleJsonResponse : function(response) {
    JSON.parse(response, function (key, val) {
      if (typeof val === 'string' && val != null) {
        var aTags = longurlplease.urlToElement[key];
        for (var ai = 0; ai < aTags.length; ai++) {
          aTag = aTags[ai];
          longurlplease.alterLink(aTag, val);
        }
      }
    });
  },
  alterLink : function(a, longUrl) {
    // You can customize this - my intention here is to alter the visible text to use as much of the long url
    // as possible, but maintain the same number of characters to help keep visual consistancy.
    if (a.href == a.innerHTML) {
      var linkText = longUrl.replace(/^http(s?):\/\//, '').replace(/^www\./, '');
      a.innerHTML = linkText.substring(0, a.innerHTML.length - 3) + '...';
    }
    a.href = longUrl;
  }
}