/*
   jReddit
   Accessing the Reddit JSON
   Requires jQuery

   Features to add:
   addEventListener for clicking on www.reddit.com urls to load JSON in #divPost.
   addEventListener for clicking for images to lightbox
   non reddit.com, and image urls should open a new window
   IDK maybe show comments?

   For browsing JSON data:
   http://www.jsoneditoronline.org/?url=https://www.reddit.com/r/Rainbow6/comments/4riri1/rrainbow6_discusses_the_operators_day_7_pulse/.json

*/

var subReddit = 'outsidelan';
var subRedditLinks = [];
var subRedditImgs = [];
var subRedditTitles = [];
var subRedditPermalinks = [];
var subRedditNumComments = [];
var subRedditAuthors = [];
var divLinks = document.querySelector('#divLinks');
var divPost = document.querySelector('#divPost');

function searchArrayByString(arr, str) {
  for (var j = 0; j < arr.length; j++) {
    if (arr[j].match(str)) return j;
  }
  return -1;
}

function mdLF(html) {
  var tmp = /(?:\r\n|\r|\n)/g;
  divPost.innerHTML=divPost.innerHTML.replace(tmp, "<br />");
}

function mdStrong(html) {
  var tmp = /\*\*(.+?)\*\*/g;
  divPost.innerHTML=divPost.innerHTML.replace(tmp, "<h2>$1</h2>");
}

function mdLinks(html) {
  var tmp = /\[(.+?)]\((.+?)\)/g;
  divPost.innerHTML=divPost.innerHTML.replace(tmp, "<a href='$2'>$1</a>");
}

function mdImg(html) {
  var tmp = /https?:\/\/.*?\.(?:png|jpg|jpeg|gif)/ig;
  divPost.innerHTML=divPost.innerHTML.replace(tmp,'<img src="$&"/>');
}

function mdYoutube(html) {
  var tmp = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;
  divPost.innerHTML=divPost.innerHTML.replace(tmp, '<iframe width="420" height="345" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>');
}

function mdLinkO(html) {
  var tmp = /\[(.+?)]\((.+?)\)/g;
  divPost.innerHTML=divPost.innerHTML.replace(tmp, "<a class=\"btn\" href=\"$2\" data-scrollto=\"overview\">$1<i class=\"fa fa-external-link\"></i></a>");
}

function renderPost(url, postTitle, postBody) {
  var html = postBody;
  divPost.innerHTML = '<h1>' + postTitle + '</h1>' + '<h2>' + html +'</h2>';
  mdYoutube(html);
  mdImg(html);
  mdLinkO(html);
  mdStrong(html);
  mdLF(html);
  mdLF(html);
}

function renderSubreddit(links, titles, permalinks, numberOfComments, authors, imgs) {
  var html = '';
  // set first reddit post ID
  var firstPostId = searchArrayByString(links, "www.reddit.com");
  // Fetch post
  if (firstPostId == -1) {
    divPost.innerHTML = "";
  }
  fetchPost(links[firstPostId]);
  // Show the recent activity links
  // i set to 1 instead of 0;
  // we don't want first post in list
  for (var i = 1, len = links.length; i < len; i++) {
//    html += '<i class="fa fa-heart-o"></i>';
//    html += '<li><img src="' + imgs[i] + '"">';
    html += '<li>';
    html += '<i class="fa fa-reddit"></i>';
    html += '<h3>';
    html += '<a href="' + links[i] + '" class="redditLinks" target="_blank">' + titles[i] + '</a>';
    html += '</h3>';
    html += '<p>';
    html += '<a class="redditComments" href="https://www.reddit.com' + permalinks[i] + '" target="_blank">' +
      numberOfComments[i] + ' comments</a> ';
    html += '</p></li>';
  }
  divLinks.innerHTML = '<div><h1>Activity</h1><p>Latest posts from the community.</p><ul>' + html + '</ul></div>';
}

function fetchSubreddit(r) {
  if (r) {
    fetch("https://www.reddit.com/r/" + r + '/.json')
      .then(function(response) {
        return response.json();
      })
    .then(function(json) {
      // build array
      for (var i = 0; i < json.data.children.length; i++) {
        subRedditLinks.push(json.data.children[i].data.url);
        subRedditPermalinks.push(json.data.children[i].data.permalink);
        subRedditNumComments.push(json.data.children[i].data.num_comments);
        subRedditTitles.push(json.data.children[i].data.title);
        subRedditAuthors.push(json.data.children[i].data.author);
        // Thubmnails
        if (json.data.children[i].data.thumbnail == 'self') {
          subRedditImgs.push('http://i.imgur.com/5YGDpij.png');
        } else {
          subRedditImgs.push(json.data.children[i].data.thumbnail);
        }
      }
      renderSubreddit(subRedditLinks, subRedditTitles, subRedditPermalinks, subRedditNumComments, subRedditAuthors, subRedditImgs);
    })
    .catch(function() {
      divPost.innerHTML = "Booo, something bad.";
    });
  }
}

function fetchPost(url) {
  if (url) {
    fetch(url + '.json')
      .then(function(response) {
        return response.json();
      })
    .then(function(json) {
      // Fetch post data
      var postTitle = json[0].data.children[0].data.title;
      var postBody = $("<div/>").html(json[0].data.children[0].data.selftext).text();
      // Render post
      renderPost(url, postTitle, postBody);
    })
    .catch(function() {
      divPost.innerHTML = "Booo, something bad.";
    });
  }
  $("#divLinks").slideUp(300).delay(800).fadeIn(600);
}

fetchSubreddit(subReddit);

