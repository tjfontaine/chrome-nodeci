// Saves options to localStorage.
function save_options() {
  var opts = {
    JENKINS_API_TOKEN: document.getElementById("JENKINS_API_TOKEN").value,
    JENKINS_USERNAME: document.getElementById("JENKINS_USERNAME").value,
  }

  chrome.storage.sync.set(opts, function () {
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
      status.innerHTML = "";
    }, 750);
  });
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  chrome.storage.sync.get(['JENKINS_API_TOKEN', 'JENKINS_USERNAME'], function (opts) {
    document.getElementById("JENKINS_API_TOKEN").value = opts.JENKINS_API_TOKEN;
    document.getElementById("JENKINS_USERNAME").value = opts.JENKINS_USERNAME;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
