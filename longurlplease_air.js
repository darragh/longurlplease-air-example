var longurlplease = {
  shortUrlsPattern : new RegExp("^http(s?)://(adjix\\.com|bit\\.ly|dwarfurl\\.com|ff\\.im|idek\\.net|is\\.gd|ln-s\\.net|loopt\\.us|ping\\.fm|piurl\\.com|piurl\\.com|poprl\\.com|qlnk\\.net|reallytinyurl\\.com|rubyurl\\.com|short\\.ie|smallr\\.com|snipr\\.com|snipurl\\.com|snurl\\.com|tinyurl\\.com|tr\\.im|twurl\\.nl|ub0\\.cc|ur1\\.ca|url\\.ie|urlx\\.ie|xrl\\.us|yep\\.it|zi\\.ma|zurl\\.ws)/.*"),
  lengthen : function(element) {
    var parent = (element == null) ? document : element ;
    var toLengthen = [];
    var urlToElement = {};
    var els = parent.getElementsByTagName('a');
    for (var elIndex = 0; elIndex < els.length; elIndex++) {
      var el = els[elIndex];
      if (longurlplease.shortUrlsPattern.test(el.href)) {
        toLengthen.push(el.href);
        var listOfElements = urlToElement[el.href];
        if (listOfElements == null)
          listOfElements = []
        listOfElements.push(el);
        urlToElement[el.href] = listOfElements;
      }
    }
    var subArray, i = 0;
    while (i < toLengthen.length) {
      subArray = toLengthen.slice(i, i + 4)
      var paramString = "";
      for (var j = 0; j < subArray.length; j++) {
        var href = subArray[j];
        paramString += "q=";
        paramString += encodeURI(href);
        if (j < subArray.length - 1)
          paramString += '&'
      }
      var loader = new air.URLLoader();
      loader.addEventListener(air.Event.COMPLETE,
              function (event) {
                var data = event.target.data;
                JSON.parse(data, function (key, val) {
                  if (typeof val === 'string' && val != null) {
                    var aTags = urlToElement[key];
                    for (var ai = 0; ai < aTags.length; ai++) {
                      aTag = aTags[ai];
                      longurlplease.alterLink(aTag, val);
                    }
                  }
                });
              }
              );
      var request = new air.URLRequest("http://www.longurlplease.com/api/v1.1?ua=air&" + paramString);
      loader.load(request);
      i = i + 4;
    }
  },
  alterLink : function(a, longUrl) {
    if (a.href == a.innerHTML) {
      var linkText = longUrl.replace(/^http(s?):\/\//, '').replace(/^www\./, '');
      a.innerHTML = linkText.substring(0, a.innerHTML.length - 3) + '...';
    }
    a.href = longUrl;
  }
}