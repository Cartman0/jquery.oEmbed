# jquery.oEmbed.js

## Summary

URL とoEmbed APIのkey(プロパティ名) から、
値を取得するプラグインです。

This Plugin can get the value form URL and key of oEmbed API(property name).

This Plugin is es6.

### About oEmbed API

Access
`Endpooint_URL?url=Permalink`
in Browser,

then view Permalink informaition(following).

~~~
{
  "title": "Title",
  "html": "<iframe src=\\"\\"><\/iframe>",
  "url": "http://example.com",
  "author_name": "hoge",
  "author_url": "http://example.com/user",
  "provider_name": "example",
  "type": "rich",
  etc...  
}
~~~

detail of oEmbed API
[oembed.com](http://www.oembed.com/)

---

## Sample Page



---

### Support Providers
- [cacoo](https://cacoo.com/lang/ja/api_oembed)
- [dailymotion](https://developer.dailymotion.com/player#player-oembed)
- flickr
- [hatena](http://developer.hatena.ne.jp/ja/documents/bookmark/apis/oembed)
- hulu
- ifttt
- [instagram](https://instagram.com/developer/embedding/?ref=driverlayer.com)
- [slideshare](http://www.slideshare.net/developers/oembed)
- [soundcloud](https://developers.soundcloud.com/docs/oembed)
- [speakerdeck](https://speakerdeck.com/faq#oembed)
- ted
- kickstarter
- [vine](https://dev.twitter.com/web/vine/oembed)
- [wordpres.com](https://developer.wordpress.com/docs/oembed-provider-api/)
- youtube
---

## How to use
Note: This <span style="color:red">MUST</span> use jquery.xdomanajax.js.
>[jquery.xdomainajax.js](https://github.com/padolsey-archive/jquery.fn/blob/master/cross-domain-ajax/jquery.xdomainajax.js)

add following in `<body>` or `<head>`.

HTML
~~~~
<body>
  ~
  <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
  <script src="jquery.xdomainajax.js"></script>
  <script src="jquery.oEmbed.js"></script>
</body>
~~~~

JS
~~~~
var url = 'http://example.com';
var key = 'html';
$.when (
  $.oEmbed(url, key)
)
.done(function(value){
  console.log(value);
});
~~~~

### Example

#### Get embed link from youtube

~~~
var url = "https://www.youtube.com/watch?v=ekK7peRxKGc";
$.when(
  $.oEmbed(url, 'html')
)
.done(function(iframe_data){
  $('.hoge').html(iframe_data);
});
~~~

#### Add customProviders
if add Provider without above,
can add `settings.customProviders` property.

~~~
var settings = {
  customProviders: [
    {
      name: 'provider_name',
      endpoint: 'endpoint_URL',
      schemelink: ['regexp_string1', ...],
      apiDataFormat: "xml" or 'json',
      queries: /*option*/{format: 'xml',... etc}
    },...
  ]
};

var url = 'http://example.com/article';
$.when(  
  $.oEmbed(url, 'html', settings)
)
.done(function(iframe){
  $('.hoge').html(iframe);
});
~~~

example of youtube Provider:
~~~
{
  name: 'youtube',
  endpoint: 'http://www.youtube.com/oembed',
  schemelink:  ['https?://www\\.youtube\\.com/watch.*'],
  queries: {'format': 'xml'},
  apiDataFormat: 'xml'
}
~~~

#### Get hatenaBlogCard

if parmalink page not provided oEmbed API,
can get embed link(hatenaBlogCard).

hatenaBlogCard sample is following:<br>
http://hatenablog-parts.com/embed?url=https://www.youtube.com/watch?v=Jc-LEG0T_4c

JS
~~~
var url = "http://example.com/article";
$.when(
  $.oEmbed(url, 'hatenablogcard')
)
.done(function(hatenaBlogCard){
  $('.hoge').html(hatenaBlogCard);
});
~~~

then, can get iframe data is
`<iframe src="http://hatenablog-parts.com/embed?url=<Permalink> width="100%">`.

#### Get hatenaBlogCard info
can view got info of hatenaBlogCard,
use dev tool in Browser.

http://hatenablog-parts.com/embed?url=https://www.youtube.com/watch?v=Jc-LEG0T_4c

~~~
<div class="embed-wrapper">

  <div class="embed-wrapper-inner">

    <div class="embed-content with-thumb">

      <div class="thumb-wrapper">
        <a href="https://www.">
        <img src="http://.jpg" class="thumb">
        </a>
      </div>

      <div class="entry-body">
        <h2 class="entry-title">
          <a href="https://">entry-title</a>
        </h2>

        <div class="entry-content">
          entry-content
        </div>
      </div>

    </div>

    <div class="embed-footer">
      <a href="https://www">
        <img src="https://.ico" class="favicon">
      </a>

      <img src="http://" alt="" class="star-count">

      <a href="http://">
        <img src="http://" class="bookmark-count">
      </a>
    </div>

  </div>

</div>
~~~

uses class name above,
gets value of elements.

##### Example Get entry-title
~~~
var url = 'http://wwww.example.com';
$.when(
  $.oEmbed(url, **'.entry-title'**, {hatenaBlogCard: 'text'}) // innerHTML
)
.done(function(entry_title){
  $('.hoge').text(entry-title); // entry-title
});
~~~

##### Example Get thumbnail
~~~
var url = 'http://wwww.example.com';
$.when(
  $.oEmbed(url, '.thumb-wrapper', {hatenaBlogCard: 'html'}) // outerHTML
)
.done(function(thumbnail){
  $('.hoge').text(thumbnail);
  /*
  <a href="http://">
    <img class="thumb" src="http://.jpg">
  </a>
  */
});
~~~

---
