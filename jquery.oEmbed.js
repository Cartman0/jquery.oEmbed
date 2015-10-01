/*
jquery.oEmbed.js
*/
(function ($) {
  'use strict';

  jQuery.support.cors = true;

  /*
    oEmbed
    settings: {
      customProviders: [
        {
          name: 'name_sting'
          endpoint: 'url_string'
          schemelink: ['regexp_string1', ...],
          apiDataFormat: "xml" or 'json',
          queries: option {format: 'xml',... etc}
        },...
      ],
      hatenaBlogCard: 'text' or 'html'
    }
  */
  $.oEmbed = function (permlink, key, settings) {
    // set Provider
    if (settings && settings.hasOwnProperty('customProviders')) {
      setProviders(settings.customProviders);
    }

    var returnHatenaBlogCardPromise = function () {
      var dfd = new $.Deferred();
      dfd.resolve(getHatenaBlogCard(permlink));
      return dfd.promise(this);
    }
    if (!key || (key.toLowerCase() === 'hatenablogcard') || (key.toLowerCase() === 'ifame')) {
      return returnHatenaBlogCardPromise();
    }

    // hatenaBlogCardInfo
    if (settings && settings.hasOwnProperty('hatenaBlogCard')) {
      var hatenaBlogCardAjax = function () {
        return $.ajax({
          url: getHatenaBlogCardRequestUrl(permlink),
          type: 'GET',
          dataType: 'html',
          crossDomain: true
        });
      };

      var dfd = new $.Deferred();
      hatenaBlogCardAjax()
        .done(function (res) {
          var res2str = function (res) {
            return res.results[0];
          }
          var hatenaBlogCardObj = getElementsOnHatenaBlogCard(res, res2str);
          if (settings.hatenaBlogCard === 'html') {
            var html = hatenaBlogCardObj.find(key)
              .html();
            dfd.resolve(html);
          } else {
            var text = hatenaBlogCardObj.find(key)
              .text();
            dfd.resolve(text);
          }
        });
      return dfd.promise(this);
    }

    // Providerを検索
    var match_provider = $.oEmbed.Providers.filter(function (p, index, array) {
      return (matchURLandSchemelink(permlink, p));
    });

    // 該当したら
    if (match_provider && (match_provider.length > 0)) {
      var dfd = new $.Deferred();
      var provider = match_provider[0];
      var dataType = null;
      if (provider.getApiDataType.toLowerCase() === 'xml'){
        dataType = 'xml';
      }
      $.ajax({
          url: getRequestUrl(permlink, provider),
          type: 'GET',
          dataType: dataType,
          data: provider.getQueries,
          crossDomain: true
        })
        .done(function (res) {
          var res2str = function (res) {
            return res.results[0];
          };
          var text = getValueInAjax(res, key, res2str, provider.getApiDataType);
          dfd.resolve(text);
        });
      return dfd.promise(this);
    }
    // 該当しない場合
    return returnHatenaBlogCardPromise();
  };

  /***************************** class ************************/
  class Provider {
    constructor(name, endpoint, schemelink, queries, apiDataType) {
        this.name_ = name && name.toLowerCase();
        this.endpoint_ = endpoint;
        this.schemelink_ = schemelink;
        this.reg_ = setReg(schemelink);

        function setReg(schemelink_arr) {
          var reg_arr = new Array();
          schemelink_arr.forEach(function (e) {
            reg_arr.push(RegExp(e));
          });
          return reg_arr;
        }
        this.queries_ = queries;
        this.apiDataType_ = apiDataType && apiDataType.toLowerCase();
      }
      // getter
    get getName() {
      return this.name_;
    }
    get getEndPoint() {
      return this.endpoint_;
    }
    get getRegExp() {
      return this.reg_;
    }
    get getQueries() {
      return this.queries_;
    }
    get getApiDataType() {
      return this.apiDataType_;
    }
  };
  //////////////////////////////////////////////////////////////////////////
  $.oEmbed.Providers = [
    // cacoo devDoc: https://cacoo.com/lang/ja/api_oembed
    new Provider('cacoo', 'http://cacoo.com/oembed.xml', ['https?://cacoo\\.com/diagrams/.*'], null, 'xml'),
    // dailymotion dailymotion https://developer.dailymotion.com/player#player-oembed
    new Provider('dailymotion', 'http://www.dailymotion.com/services/oembed', ['https?://www\\.dailymotion\\.com/video/.*'], {
      'format': 'xml'
    }, 'xml'),
    // flickr
    new Provider('flickr', 'http://www.flickr.com/services/oembed/', ['https?://.*\\.flickr\\.com/photos/.*', 'http[s?]://flic\\.kr/p/.*'], null, 'xml'),
    //hatena
    new Provider('hatena', 'http://hatenablog.com/oembed', ['https?://.*hatenablog\\.com/.*'], {
      'format': 'xml'
    }, 'xml'),
    // hulu
    new Provider('hulu', 'http://www.hulu.com/api/oembed.xml', ['https?://www\\.hulu\\.com/watch/.*'], null, 'xml'),
    // ifttt
    new Provider('ifttt', 'https://www.ifttt.com/oembed/', ['https?://ifttt\\.com/recipes/.*'], {
      'format': 'xml'
    }, 'xml'),
    // instagram
    new Provider('instagram', 'http://api.instagram.com/oembed', ['https?://instagr\\.am/p/.*', 'https?://instagram\\.com/p/.*'],
    null, 'json'),
    // kickstarter
    new Provider('kickstarter', 'http://www.kickstarter.com/services/oembed',
    ['https?://www\\.kickstarter\\.com/projects/.*'], null, 'json'),
    // slideshare
    new Provider('slideshare', 'http://www.slideshare.net/api/oembed/2', ['https?://www\\.slideshare\\.net/.*/.*'], null, 'xml'),
    // soundcloud
    new Provider('soundcloud', 'https://soundcloud.com/oembed', ['https?://soundcloud\\.com/.*'], null, 'xml'),
    // speakerdeck
    new Provider('speakerdeck', 'https://speakerdeck.com/oembed.json',
    ['https?://speakerdeck\\.com/.*/.*'], null, 'json'),
    // ted
    new Provider('ted', 'http://www.ted.com/talks/oembed.xml', ['https?://(?:www\\.)?ted\\.com/talks/.*'], null, 'xml'),
    // vine https://dev.twitter.com/web/vine/oembed http://westplain.sakuraweb.com/translate/twitter/Documentation/Twitter-for-Websites/Vine/oEmbed.cgi
    new Provider('vine', 'https://vine.co/oembed.xml',
    ['https?://vine\\.co/v/.*'], null, 'xml'),
    // wordpress.com
    new Provider('wordpress.com', 'http://public-api.wordpress.com/oembed/1.0/', ['https?://.*\\.wordpress.com/.*'], {
      'format': 'xml',
      'for': 'oembed.com'
    }, 'xml'),
    // youtube
    new Provider('youtube', 'http://www.youtube.com/oembed', ['https?://www\\.youtube\\.com/watch.*'], {
      'format': 'xml'
    }, 'xml')
  ];
  // hatenablog-parts
  $.oEmbed.Providers.defaultProvider = new Provider('hatenablog-parts', 'http://hatenablog-parts.com/embed', ['.*'], null, null);

  //////////////////////////////////////////////////////////////////////////////

  /******************* functions ****************************************/
  function getRequestUrl(permalink, provider) {
    console.log(provider.getEndPoint  + ' ' + permalink);
    return provider.endpoint_ + '?url=' + permalink;
  }

  function getHatenaBlogCardRequestUrl(permalink) {
    return getRequestUrl(permalink, $.oEmbed.Providers.defaultProvider);
  }
  /*
  matchURLandSchemelink(url, provider)
  boolean:
  true: match
  false: not match
  */
  function matchURLandSchemelink(url, provider) {
    var flag = provider.getRegExp
      .some(function (reg) {
        var match_arr = url.match(reg);
        return (match_arr && (match_arr.length > 0));
      });
    return flag;
  }

  /*
  ajaxデータから指定の値を取得
  */
  function getValueInAjax(result, key, res2str, apiDataType) {
    if (apiDataType.toLowerCase() === "json") {
      return getValueInAjaxJSON(result, key, res2str);
    }
    return getValueInAjaxXML(result, key, res2str);
  }

  /*
    ajaxデータから指定の値を取得
    (JSON形式)
  */
  function getValueInAjaxJSON(result, key, res2str) {
    /*json形式試せるか*/
    console.log(result);
    var html_text = res2str(result);
    var pattern = /[\s\S]*<body>[\s\S]*(\{[\s\S]*\})[\s\S]*<\/body>[\s\S]*/mi;
    var matches_arr = html_text.match(pattern);
    var json_str = matches_arr[1]
      .replace(/"?\\&quot;"?/g, '\\"');
    let json_obj = JSON.parse(json_str);
    var json_value = json_obj[key];
    if (!json_value) {
      console.log('Not Found value in the key.');
      console.log('Json Obj got is');
      console.log(json_obj);
      return false;
    }
    // console.log(json_value);
    return json_value;
  }

  /*
    ajaxデータから指定の値を取得
    (XML形式)
  */
  function getValueInAjaxXML(result, get_label, res2str) {
    /*
      ajaxのresulet から、文字列に変換
    */
    var str = res2str(result);
    console.log(str);
    if (!str) {
      console.log('Error: str is null.');
      return false;
    }
    // xmlに変換
    var xml_obj = $.parseXML(str);
    console.log(xml_obj);
    // 指定がなかったらobjそのまま返す
    if (!get_label) {
      return xml_obj;
    }

    var get_label_obj = $(xml_obj)
      .find(get_label);
    if (!get_label_obj) {
      console.log('Not want to get_label.');
      return false;
    }
    var text = $(get_label_obj).text();
    return text;
  }

  /*
    getHatenaBlogCard(permalink)
    key:
    class名
    記事タイトル：.entry-title
    記事概要：.entry-content
    サムネ：thumb-wrapper
    etc
  */
  function getHatenaBlogCard(permalink) {
    var iframe = '<iframe src="http://hatenablog-parts.com/embed?url=' + permalink + '" width="100%">';
    return iframe;
  }

  function getElementsOnHatenaBlogCard(res, res2str) {
    var html_text = res2str(res);
    var html_obj = $.parseHTML(html_text);
    var embed_wrapper_obj = $(html_obj[11]);
    return embed_wrapper_obj;
  }

  function setProviders(providers_info) {
    if (providers_info) {
      for (var p_info of providers_info) {
        var p = new Provider(p_info.name, p_info.endpoint, p_info.schemelink, p_info.queries, p_info.apiDataType);
        $.oEmbed.Providers.push(p);
      }
    }
  }

})(jQuery);
