import demographicsQuestions from "./demographics.js";

function qNQuestionComparator(a, b) {
  const n1 = Number(a[0].slice(1));
  const n2 = Number(b[0].slice(1));
  return n1 - n2;
}

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
      /*html*/ `<p class="lead">You will be asked to rate the gender (masculine/feminine) of 100 English words.<br>
      Most of the words are first names. Some are last names. And a few are regular English words.<br>
      Please use your intuition to rate each word from very feminine to very masculine using the 1-5 keys.<br>
      Try to use the entire scale. It's ok to go with your first impression for each word, but please do not rush.<br>
      <b>Inattentive responding may result in a denial of payment.</b></p> ${continue_space}`
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
      expTimer: -1,
      response: -1,
      trial_number: trial_number,
      rt: -1,
      choice: null,
      unknown: null
    };

    const questions = [
      {
        key: trial.question_type,
        prompt: /*html*/ `
        <h2>
          ${trial.question_prompt_pre}${trial.word}${trial.question_prompt_post}
        </h2>`,
        labels: [
          trial.choice1,
          trial.choice2,
          trial.choice3,
          trial.choice4,
          trial.choice5,
          trial.choice6,
          trial.choice7
        ],
        required: true
      }
    ];

    // TODO: Create custom survey-likert with checkbox for unknown word choice.
    const questionTrial = {
      type: "lupyanlab-survey-likert-skip",
      preamble: /*html*/ `        
          <h4 style="text-align:center;margin-top:0;width:50vw;margin:auto;">Trial ${trial_number} of ${num_trials}</h4>
        `,
      questions,
      button_label: "Submit",
      skip_checkbox_label:
        "I don’t know the meaning or the pronunciation of this word.",

      on_finish: function(data) {
        const responses = Object.entries(JSON.parse(data.responses))
          .sort(qNQuestionComparator)
          .reduce(
            (acc, [QN, response], i) => ({
              ...acc,
              [questions[i].key]: response + 1 // choices start with 1 instead of 0
            }),
            {
              ...response,
              rt: data.rt,
              expTimer: data.time_elapsed / 1000,
              unknown: data.skipped ? 1 : 0
            }
          );
        console.log(responses);

        // POST response data to server
        $.ajax({
          url: "http://" + document.domain + ":" + PORT + "/data",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(responses),
          success: function() {
            console.log(responses);
          }
        });
        jsPsych.setProgressBar(progress_number / num_trials);
        progress_number++;
      }
    };

    timeline.push(questionTrial);
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
        <p>The purpose of this HIT is to obtain gender ratings for various words to better understand how gender information is represented in children's books.
        
        <p>
        If you have any questions or comments, please email lupyan@wisc.edu.`;
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
