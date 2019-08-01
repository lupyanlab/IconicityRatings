import { runExperiment } from "./experiment.js";
import PORT from "./port.js";

const dev = false;
const FULLSCREEN = true;
$(document).ready(function() {
  $(window).on("beforeunload", function() {
    return "Are you sure you want to leave?";
  });

  //////////////////////////////////////////
  // DEFINE workerId, hitId, assignmentId HERE
  //////////////////////////////////////////
  let subjCode = $.urlParam("workerId") || "unknown";
  let reset = $.urlParam("newSet") || "false";
  let workerId = "workerId";
  let assignmentId = "assignmentId";
  let hitId = "hitId";

  $("#loading").html(
    '<h2 style="text-align:center;">Loading trials... please wait.</h2> </br> <div  class="col-md-2 col-md-offset-5"><img src="img/preloader.gif"></div>'
  );

  // This calls server to run python generate trials (judements.py) script
  // Then passes the generated trials to the experiment
  $.ajax({
    url: "http://" + document.domain + ":" + PORT + "/trials",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ subjCode, reset, dev }),
    success: function(data) {
      console.log(data);

      $("#loading").remove();
      runExperiment(
        data.trials,
        subjCode,
        workerId,
        assignmentId,
        hitId,
        FULLSCREEN,
        PORT,
        dev,
        data.maxBatchNum,
      );
    }
  });
});
