var HOSTNAME = 'jenkins.nodejs.org';
var STORAGE = [
  'JENKINS_USERNAME',
  'JENKINS_API_TOKEN',
];

function canBuild(opts) {
  return opts.JENKINS_USERNAME && opts.JENKINS_API_TOKEN;
}

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

function buildPR(elm, opts) {
  if (canBuild(opts)) {
    var pr = $(elm).data('pr');
    $.post('http://' + HOSTNAME + pr + '?' + $.param(opts), function () { location.reload(); });
  }
}

function pullList(opts) {
  $('.pulls-list div').each(function (i, div) {
    var h3 = $(div).children('h3');
    if (h3.length) {
      var url = 'http://' + HOSTNAME;
      var a = $(div).children('h3').children('a')[0];
      url += a.pathname;
      $.getJSON(url, function (data) {
        $(a).after('<button data-pr="'+ a.pathname +'" ' + getSI(data, 'jenkins-build') +'>'+ data.status + '</div>');
        $('.jenkins-build').click(function () {
          buildPR(this, opts);
        });
      });
    }
  });
}

function pullRequest(pr, opts) {
  var url = 'http://' + HOSTNAME + pr;
  $.getJSON(url, function (data) {
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

    if (canBuild(opts) && data.status != 'BUILDING') {
      var html = '<button style="float: right" class="button primary jenkins-build" data-pr="';
      html += window.location.pathname+'">Build</button><br/><br/>';

      $('#jenkinsBuildResults').append(html);

      $('#jenkinsBuild').click(function () {
        buildPR(this, opts);
      });
    }
  });
}

chrome.storage.sync.get(STORAGE, function (opts) {
  if (window.location.pathname.match(/\d+$/)) {
    pullRequest(window.location.pathname, opts);
  } else {
    pullList(opts);
  }
});
