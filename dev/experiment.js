import demographicsQuestions from "./demographics.js";

// Function Call to Run the experiment
export function runExperiment(
  trials,
  subjCode,
  workerId,
  assignmentId,
  hitId,
  FULLSCREEN,
  PORT
) {
  let timeline = [];

  // Data that is collected for jsPsych
  let turkInfo = jsPsych.turk.turkInfo();
  let participantID = makeid() + "iTi" + makeid();

  jsPsych.data.addProperties({
    subject: participantID,
    condition: "explicit",
    group: "shuffled",
    workerId: workerId,
    assginementId: assignmentId,
    hitId: hitId
  });

  // sample function that might be used to check if a subject has given
  // consent to participate.
  var check_consent = function(elem) {
    if ($("#consent_checkbox").is(":checked")) {
      return true;
    } else {
      alert(
        "If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'"
      );
      return false;
    }
    return false;
  };

  // declare the block.
  var consent = {
    type: "external-html",
    url: "./consent.html",
    cont_btn: "start",
    check_fn: check_consent
  };

  timeline.push(consent);

  let continue_space =
    "<div class='right small'>(press SPACE to continue)</div>";

  let instructions = {
    type: "instructions",
    key_forward: "space",
    key_backward: "backspace",
    pages: [
      /*html*/ `<p class="lead">In this HIT, you will see various images of familiar objects. For each image, please rate how typical it is of its category.
            For example, you may be shown a series of motorcycles and asked how typical each one is of motorcyles in general.
            </p> <p class="lead">Use the  1-5 keys on the keyboard to respond. 1 means very typical. 5 means very atypical. Please try to use the entire scale, not just the 1/5 keys. If you rush through without attending to the images, we may deny payment.
            </p> ${continue_space}`
    ]
  };

  timeline.push(instructions);
  const num_trials = trials.length;

  let trial_number = 1;
  let progress_number = 1;

  // Pushes each audio trial to timeline
  trials.forEach(trial => {
    let response = {
      subjCode: subjCode,
      word: trial.word,
      question_prompt_pre: trial.question_prompt_pre,
      question_prompt_post: trial.question_prompt_post,
      question_type: trial.question_type,
      bin: trial.bin,
      choice1: trial.choice1,
      choice2: trial.choice2,
      choice3: trial.choice3,
      choice4: trial.choice4,
      choice5: trial.choice5,
      expTimer: -1,
      response: -1,
      trial_number: trial_number,
      rt: -1
    };

    let stimulus = /*html*/ `
      <h4 style="text-align:center;margin-top:0;">Trial ${trial_number} of ${num_trials}</h4>
      <div style="padding:10%;"><h1>${trial.question_prompt_pre}${trial.word}${trial.question_prompt_post}</h1></div>
  `;

    const choices = [trial.choice1, trial.choice2, trial.choice3, trial.choice4, trial.choice5];

    let circles = choices.map(choice => {
      return /*html*/ `
          <div class="choice">
              <div class="choice-circle empty-circle"></div>
              <div class="text">${choice}</div>
          </div>
      `;
    });

    let prompt = /*html*/ `
          <div class="bar">
              ${circles.join("")}
          </div>
      `;

    // Picture Trial
    let pictureTrial = {
      type: "html-keyboard-response",
      choices: choices.map((choice, index) => {
        return `${index + 1}`;
      }),

      stimulus: stimulus,

      prompt: function() {
        return prompt;
      },

      on_finish: function(data) {
        response.response = String.fromCharCode(data.key_press);
        response.choice = choices[Number(response.response) - 1];
        response.rt = data.rt;
        response.expTimer = data.time_elapsed / 1000;

        // POST response data to server
        $.ajax({
          url: "http://" + document.domain + ":" + PORT + "/data",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(response),
          success: function() {
            console.log(response);
          }
        });
      }
    };
    timeline.push(pictureTrial);

    // let subject view their choice
    let breakTrial = {
      type: "html-keyboard-response",
      trial_duration: 500,
      response_ends_trial: false,

      stimulus: stimulus,

      prompt: function() {
        const circles = choices.map((choice, index) => {
          if (choice == response.choice) {
            return /*html*/ `
                      <div class="choice">
                        <div class="choice-circle filled-circle"></div>
                        <div class="text">${choice}</div>
                      </div>
                    `;
          }
          return /*html*/ `
                <div class="choice">
                  <div class="choice-circle empty-circle"></div>
                  <div class="text">${choice}</div>
                </div>
                `;
        });

        const prompt = /*html*/ `
                <div class="bar">
                    ${circles.join("")}
                </div>
            `;
        return prompt;
      },

      on_finish: function() {
        jsPsych.setProgressBar((progress_number - 1) / num_trials);
        progress_number++;
      }
    };
    timeline.push(breakTrial);
    trial_number++;
  });

  let questionsInstructions = {
    type: "instructions",
    key_forward: "space",
    key_backward: "backspace",
    pages: [
      `<p class="lead">Thank you! We'll now ask a few demographic questions and you'll be done!
            </p> ${continue_space}`
    ]
  };
  timeline.push(questionsInstructions);

  window.questions = trials.questions; // allow surveyjs to access questions

  let demographicsTrial = {
    type: "surveyjs",
    questions: demographicsQuestions,
    on_finish: function(data) {
      let demographicsResponses = data.response;
      let demographics = Object.assign({ subjCode }, demographicsResponses);
      console.log(demographics);
      // POST demographics data to server
      $.ajax({
        url: "http://" + document.domain + ":" + PORT + "/demographics",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(demographics),
        success: function() {}
      });

      let endmessage = `Thank you for participating! Your completion code is ${participantID}. Copy and paste this in 
        MTurk to get paid. 
        <p>The purpose of this HIT is to assess the extent to which different people agree what makes
        a particular dog, cat, or car typical.
        
        <p>
        If you have any questions or comments, please email cschonberg@wisc.edu.`;
      jsPsych.endExperiment(endmessage);
    }
  };
  timeline.push(demographicsTrial);

  startExperiment();
  document.timeline = timeline;
  function startExperiment() {
    jsPsych.init({
      default_iti: 0,
      timeline: timeline,
      fullscreen: FULLSCREEN,
      show_progress_bar: true,
      auto_update_progress_bar: false
    });
  }
}
