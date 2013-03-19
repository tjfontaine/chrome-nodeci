var HOSTNAME = 'jenkins.nodejs.org';
var URL = 'http://' + HOSTNAME + window.location.pathname;

function getSI(data, klass) {
  var state = 'class="'+klass+' state-indicator ';
  var color = '';
      color = 'style="color:black;"';
  switch (data.status) {
    case 'SUCCESS':
      state += 'open';
      break;
    case 'UNSTABLE':
      state += 'renamed';
      break;
    case 'FAILURE':
      state += 'closed';
      break;
  }
  state += '" ' + color;
  return state;
};

function buildPR(pr) {
  chrome.storage.sync.get(['JENKINS_USERNAME', 'JENKINS_API_TOKEN'], function (opts) {
    if (opts.JENKINS_USERNAME && opts.JENKINS_API_TOKEN)
      $.post('http://' + HOSTNAME + pr + '?' + $.param(opts), function () { location.reload(); });
  });
}

$('.pulls-list div').each(function (i, div) {
  var h3 = $(div).children('h3');
  if (h3.length) {
    var url = 'http://' + HOSTNAME;
    var a = $(div).children('h3').children('a')[0];
    url += a.pathname;
    $.getJSON(url, function (data) {
      $(a).after('<button data-pr="'+ a.pathname +'" ' + getSI(data, 'jenkins-build') +'>'+ data.status + '</div>');
      $('.jenkins-build').click(function () {
        buildPR($(this).data('pr'));
      });
    });
  }
});

if (URL.match(/\d+$/)) {
$.getJSON(URL, function (data) {
  $('#pr_contributors_box').before('<div id="jenkins"></div>');
  $('#jenkins').append('<div id="jenkinsBuildIndicator" ' + getSI(data, '') + '>'+ data.status + '</div>');
  $('#jenkins').append('<div id="jenkinsBuildResults" class="discussion-bubble-inner"></div>');

  if (data.status != 'PASSING') {
    var html = '<table class="commits commits-conendsed" width="100%">';
    data.result = data.result || {};
    $.each(data.result, function (i) {
      var result = data.result[i];
      if (!result) return;
      if (result.length) {
        result.forEach(function (test) {
          html += '<tr class="commit js-details-container js-socket-channel js-updatable-content">';
          html += '<td class="author">' + i + '</td>';
          html += '<td class="message"><code>';
          html += '<a target="_new" href="' + test.url.replace('/artifact/test.tap', '');
          html += '/tapTestReport/test.tap-' + test.number + '/">';
          html += test.desc + '</a></code></td>';
          html += '</tr>';
        });
      }
    });
    html += '</table>';
    $('#jenkinsBuildResults').append(html);
  }

  if (data.url)
    $('#jenkinsBuildResults').append('<a target="_new" href="' + data.url + '">Last build</a>');

  //if (data.started)
  //  $('#jenkinsBuildResults').append(' Started at: ' + data.started);

  if (data.by)
    $('#jenkinsBuildResults').append(' By: ' + data.by);

  if (data.status == 'BUILDING') return;

  chrome.storage.sync.get(['JENKINS_USERNAME', 'JENKINS_API_TOKEN'], function (opts) {
    if (opts.JENKINS_USERNAME)
      $('#jenkinsBuildResults').append('<button id="jenkinsBuild" type="submit" style="float: right" class="button primary">Build</button><br/><br/>');

    $('#jenkinsBuild').click(function () {
      $.post(URL + '?' + $.param(opts), function () { location.reload(); });
    });
  });
});
}
