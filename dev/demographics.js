
export default [
	{ type: "radiogroup", name: "gender", colCount: 0, isRequired: true, title: "What is your gender?", choices: ["Male", "Female", "Other", "NA|Prefer not to say"] },
	{ type: "radiogroup", name: "native", colCount: 0, isRequired: true, title: "Are you a native English speaker", choices: ["1|Yes", "0|No"] },
	{ type: "text", name: "native language", visibleIf: "{native}='No'", title: "Please indicate your native language or languages:" },
	{ type: "text", name: "languages", title: "What other languages do you speak?" },
	{ type: "text", name: "age", title: "What is your age?", width: "auto" },
	{ type: "radiogroup", name: "degree", isRequired: true, title: "What is the highest degree or level of school you have completed. If currently enrolled, indicate highest degree received.", choices: ["1|Less than high school", "2|High school diploma", "3|Some college, no degree", "4|Associate's degree", "5|Bachelor's degree", "6|PhD, law, or medical degree", "NA|Prefer not to say"] },
	{ type: "radiogroup", name: "loading", isRequired: true, title: "Did the loading of the images lag at all for you?", choices: ["1|Images appeared with no delay", "2|Images appeared with a delay at first, then no delay.", "3|One image would load, then the other"] },
	{ type: "radiogroup", name: "cats_experience", colCount: 0, isRequired: true, title: "How much do you know about cats?", choices: ["1|Less than an average person", "2|About the same as average", "3|More than average", "4|Much more than average"] },
	{ type: "radiogroup", name: "dogs_experience", colCount: 0, isRequired: true, title: "How much do you know about dogs?", choices: ["1|Less than an average person", "2|About the same as average", "3|More than average", "(4|Much more than average"] },
	{ type: "radiogroup", name: "birds_experience", colCount: 0, isRequired: true, title: "How much do you know about birds?", choices: ["1|Less than an average person", "2|About the same as average", "3|More than average", "4|Much more than average"] },
	{ type: "radiogroup", name: "fish_experience", colCount: 0, isRequired: true, title: "How much do you know about fish?", choices: ["1|Less than an average person", "2|About the same as average", "3|More than average", "4|Much more than average"] },
	{ type: "radiogroup", name: "cars_experience", colCount: 0, isRequired: true, title: "How much do you know about cars?", choices: ["1|Less than an average person", "2|About the same as average", "3|More than average", "4|Much more than average"] },
	{ type: "radiogroup", name: "trains_experience", colCount: 0, isRequired: true, title: "How much do you know about trains?", choices: ["1|Less than an average person", "2|About the same as average", "3|More than average", "4|Much more than average"] },
	{ type: "radiogroup", name: "planes_experience", colCount: 0, isRequired: true, title: "How much do you know about planes?", choices: ["1|Less than an average person", "2|About the same as average", "3|More than average", "4|Much more than average"] },
	{ type: "radiogroup", name: "boats_experience", colCount: 0, isRequired: true, title: "How much do you know about boats?", choices: ["1|Less than an average person", "2|About the same as average", "3|More than average", "4|Much more than average"] },
	{ type: "text", name: "comments", isRequired: false, title: "If you have any comments for us, please enter them here" },
];
