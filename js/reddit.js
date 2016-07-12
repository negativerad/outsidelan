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

function renderPost(url, postTitle, postBody) {
  divPost.innerHTML = '<h1><a href="' + url + '">' + postTitle + '</a></h1>' + postBody + '';
}

function renderSubreddit(links, titles, permalinks, numberOfComments, authors, imgs) {
  var html = '<h2>Recent Activity</h2>';
  // set first reddit post ID
  var firstPostId = searchArrayByString(links, "www.reddit.com");
  // Fetch post
  if (firstPostId == -1) {
    divPost.innerHTML = "";
  }
  fetchPost(links[firstPostId]);
  // Show the recent activity links
  for (var i = 0, len = links.length; i < len; i++) {
    html += '<div class="entry">';
    html += '<img src="' + imgs[i] + '">';
    html += '<a href="' + links[i] + '" class="redditLinks" target="_blank">' + titles[i] + '</a>';
    html += '<div class="subEntry">';
    html += '<a class="redditComments" href="https://www.reddit.com' + permalinks[i] + '" target="_blank">[' +
      numberOfComments[i] + ' comments]</a> ';
    html += 'posted by <a class="redditAuthors" href="https://www.reddit.com/user/' + authors[i] + '" target="_blank">' + authors[i] + '</a>';
    html += '</div></div>';
  }
  divLinks.innerHTML = '<div>' + html + '</div>';
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
        var postBody = $("<div/>").html(json[0].data.children[0].data.selftext_html).text();
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

