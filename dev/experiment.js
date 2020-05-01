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
  PORT,
  dev,
  maxBatchNum,
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
    url: "./consent_pool.html",
    cont_btn: "start",
    check_fn: check_consent
  };

  timeline.push(consent);

  const continue_space =
    "<p><div class='right small'>(press SPACE to continue)</div></p>";

  let instructions = {
    type: "instructions",
    key_forward: "space",
    key_backward: "backspace",
    



    pages: [
      `<p class="lead"><b>Thank you for participating in this experiment!</b><br>
      In this task you will be rating some English words on their "iconicity". Please read the following instructions very carefully as they are important for doing this task.
      ${continue_space}`,

      `<p class="text-left">Some English words sound like what they mean. These words are <b>iconic</b>. You might be able to guess the meaning of such a word even if you did not know English.<br><br>
      Some words that people have rated <b>high</b> in iconicity are “click,” “screech,” and “stomp,” because they sound very much like what they mean.<br><br>
      Some words that people have rated <b>moderate</b> in iconicity are “porcupine,” “glowing,” and “steep,” because they sound somewhat like what they mean.<br><br>
      Some words rated <b>low</b> in iconicity are “menu,” “amateur,” and “are,” because they do not sound at all like what they mean.<br><br>

      <b>In this task, you are going to rate words for how iconic they are. You will rate each word on a scale from 1 to 7. A rating of 1 indicates that the word is not at all iconic and does not at all sound like what it means. 7 indicates that the word is high in iconicity and sounds very much like what it means.</b>
      ${continue_space}`,


      `<p class="text-left"></b>
      It is important that you say the word out loud to yourself, and that you think about its meaning.<br><br>

      If you do not know the meaning of a specific word or do not know how to pronounce it, you have the option of skipping it.
      ${continue_space}`,

      `<p class="text-left"></b>
      Try to focus on the word meaning of the whole word, rather than decomposing it into parts. 
      For example, when rating ‘butterfly’ think of the insect rather than "butter" and "fly", and rate how well the whole meaning relates to the sound of the whole word "butterfly".`,

      `<p class="text-left">When you are done with this list of words, you will get one more list of words, for about 100 total.</p>
      ${continue_space}`,

      // `<p class="text-left">When you are done with this list of words, you will have the option to complete additional lists, e.g., if you complete two lists you will get double the payment.</p>
      // ${continue_space}`,

      `<p class="lead">Please remember to say the word to yourself and to think about the meaning of each word.<br><br>
      Ready to start?</p>
      ${continue_space}`,

    ]
  };

  timeline.push(instructions);

  
  let trial_number = 1;

  const jSPsychTrials = {
    timeline: trials.length === 0 ? [] : [createJSPsychTrial()],
    // trial_number starts with 1 and is incremented in the on_finish function
    loop_function() {
      trial_number++;
      const shouldLoop = (trial_number - 1) < trials.length;
      if (!shouldLoop) {
        trial_number = 1;
      }
      return shouldLoop;
    } 
  }

  timeline.push(jSPsychTrials);


  const askSecondBatchTrial = {
    type: "html-button-response",
    stimulus:
      "Do you want to do another list?",
    choices: ['Yes. (choose this if you are a UW student).', 'No thanks.'], 
  };

  if (maxBatchNum < 2) {
    timeline.push(askSecondBatchTrial);
  }

  const secondBatchTrial = {
    timeline: [
      {
        type: "call-function",
        async: true,
        func(done) {
          maxBatchNum++;
          $.ajax({
            url: "http://" + document.domain + ":" + PORT + "/trials",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ subjCode, reset: true, dev }),
            success: function(data) {
              console.log(data);

              trials = data.trials;

              done(data);
            }
          });
        }
      },
      {
        timeline: [createJSPsychTrial()],
        // trial_number starts with 1 and is incremented in the on_finish function
        loop_function() {
          trial_number++;
          const shouldLoop = (trial_number - 1) < trials.length;
          if (!shouldLoop) {
            trial_number = 1;
          }
          return shouldLoop;
        } 
      },
    ],
    conditional_function: function() {
      if (maxBatchNum >= 2) {
        return false;
      }
      // get the data from the previous trial,
      // and check which key was pressed
      const data = jsPsych.data
        .get()
        .last(1)
        .values()[0];
      return data.button_pressed == 0;
      }
    }
  timeline.push(secondBatchTrial);

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

      let endmessage_pool = `Thank you for participating! Your completion code is ${participantID}. Please retain this code in case there is an issue with credit assignment.
        <p>The purpose of this task is to rank English words on iconicity to better understand the structure of language.        
        <p>
        If you have any questions or comments, please email lupyan@wisc.edu.`;

      let endmessage = `Thank you for participating! Your completion code is ${participantID}. Copy and paste this in 
        MTurk to get paid. 
        <p>The purpose of this HIT is to rank English words on iconicity to better understand the structure of language.
        
        <p>
        If you have any questions or comments, please email lupyan@wisc.edu.`;
      jsPsych.endExperiment(endmessage_pool);
    }
  };
  timeline.push(demographicsTrial);

  // Empty the timeline if there are no trials.
  if (trials.length == 0 && maxBatchNum > 2) {
    timeline = [{
      type: "instructions",
      key_forward: "space",
      key_backward: "backspace",
      pages: [
        /*html*/ `<p class="lead">
        You've finished 2 word lists already and cannot complete more.<br>
        </p>`
      ]
    }];
  }

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

  
function createJSPsychTrial() {
    return {
      type: "lupyanlab-survey-likert-skip",
      preamble: () => /*html*/ `
          <h4 style="text-align:center;margin-top:0;width:50vw;margin:auto;">Trial ${trial_number} of ${trials.length}</h4>
        `,
      questions: () => [
      {
        key: trials[trial_number-1].question_type,
        prompt: /*html*/ `
        <h3>${trials[trial_number-1].question_prompt_pre}</h3>
        <h1><b>
          ${trials[trial_number-1].word}${trials[trial_number-1].question_prompt_post}
          </b>
        </h1>`,
        labels: [
          trials[trial_number-1].choice1,
          trials[trial_number-1].choice2,
          trials[trial_number-1].choice3,
          trials[trial_number-1].choice4,
          trials[trial_number-1].choice5,
          trials[trial_number-1].choice6,
          trials[trial_number-1].choice7
        ],
        required: true
      }
    ],
    button_label: "Skip",
    skip_label:
      "I don’t know the meaning or the pronunciation of this word.",

    on_finish: function(data) {
      const response =
          {
            subjCode: subjCode,
            word: trials[trial_number-1].word,
            question_prompt_pre: trials[trial_number-1].question_prompt_pre,
            question_prompt_post: trials[trial_number-1].question_prompt_post,
            question_type: trials[trial_number-1].question_type,
            bin: trials[trial_number-1].bin,
            expTimer: -1,
            response: -1,
            trial_number: trial_number,
            unknown: null,
            rt: data.rt,
            expTimer: data.time_elapsed / 1000,
            unknown: data.skipped ? 1 : 0,
            file: trials[trial_number-1].batchFile,
            choice: JSON.parse(data.responses).Q0 + 1,
            batchNum: maxBatchNum,
            batchFile: trials[trial_number-1].batchFile,
          }

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
      jsPsych.setProgressBar(trial_number / trials.length);
    }
  };
}
}

