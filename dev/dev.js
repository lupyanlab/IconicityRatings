import { runExperiment } from "./experiment.js";

const PORT = 7102;
const FULLSCREEN = false;
const dev = true;

$(document).ready(function() {
  // This listens to the form on-submit action
  $("form").submit(function() {
    // Remove

    //////////////////////////////////////////
    // DEFINE workerId, hitId, assignmentId HERE
    //////////////////////////////////////////
    let subjCode = $("#subjCode")
      .val()
      .slice();
    let reset = $("#reset").val();
    let workerId = "null";
    let assignmentId = "null";
    let hitId = "null";

    $("form").remove();
    $("#loading").html(
      '<h2 style="text-align:center;">Loading trials... please wait.</h2> </br> <div  class="col-md-2 col-md-offset-5"><img src="img/preloader.gif"></div>'
    );

    // This calls server to run python generate trials (judements.py) script
    // Then passes the generated trials to the experiment
    $.ajax({
      url: "http://" + document.domain + ":" + PORT + "/trials",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ subjCode, reset, dev: true }),
      success: function(data) {
        console.log(data);

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
  }); // Remove
});
