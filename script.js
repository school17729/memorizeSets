const termSpan = document.getElementById("term");

const definitionInput = document.getElementById("definition");
let definitionInputBorderColor = [
    0, 0, 0
];

const correctDefinitionSpan = document.getElementById("correctDefinition");

const nextSpan = document.getElementById("next");

const choiceDiv = document.getElementById("choiceArea");

choiceDiv.style.display = "none";
let choiceBackgroundColors = [
    [255, 255, 255],
    [255, 255, 255],
    [255, 255, 255],
    [255, 255, 255],
];

const answerDiv = document.getElementById("answerArea");

const overrideSpan = document.getElementById("override");

const stuckSpan = document.getElementById("stuck");

const resetSpan = document.getElementById("reset");

const progressNumberSpan = document.getElementById("progressNumber");

const progressOutlineDiv = document.getElementById("progress");
progressOutlineDiv.style.width = (window.innerWidth * 0.8) + "px";

const progressDiv = document.getElementById("progressInside");

//--------------------------------------------------------------------

class Pair {
    constructor(term, definition) {
        // term: string
        // definition: string
        
        this.term = term; // string
        this.definition = definition; // string

        this.score = -2; // number
    }
}

class Session {
    constructor() {
        // name: string

        this.name = ""; // string
        this.set = []; // Pair[]

        this.stringPairs = [];
        this.importedSet = false;
        this.formattedSet = false;
        this.namedSet = false;

        this.clickCooldown = false;
        this.enterCooldown = false;

        this.currentPair = []; // Pair
        this.currentPairIndex = 0; // number
        this.currentChoice = 0; // number
        this.currentMode = "Choices"; // string

        this.cheated = false;

        this.currentProgress = 0; // number
        this.totalProgress = 0; // number

        this.resetConfirmation = false;

        this.init();
    }

    init() {
        this.initDisplay();
        this.addListeners();
    }

    initDisplay() {
        termSpan.style.display = "block";

        definitionInput.style.display = "block";
        correctDefinitionSpan.style.display = "none";
        nextSpan.style.display = "none";

        choiceDiv.style.display = "none";

        overrideSpan.style.display = "none";
        stuckSpan.style.display = "none";
        resetSpan.style.display = "none";

        progressNumberSpan.style.display = "none";
        progressOutlineDiv.style.display = "none";
    }

    startDisplay() {
        termSpan.style.display = "block";

        definitionInput.style.display = "none";
        correctDefinitionSpan.style.display = "none";
        nextSpan.style.display = "none";

        choiceDiv.style.display = "none";

        overrideSpan.style.display = "none";
        stuckSpan.style.display = "flex";
        resetSpan.style.display = "flex";

        progressNumberSpan.style.display = "block";
        progressOutlineDiv.style.display = "flex";
    }

    addListeners() {
        for (let i = 0; i < choiceDiv.children.length; i++) {
            choiceDiv.children.item(i).addEventListener("click",
                () => {
                    if (!this.clickCooldown) {
                        this.submitAnswer(i);
                    }
                }
            );
        }

        nextSpan.addEventListener("click",
            () => {
                this.cheated = false;

                this.displayProgress();
                this.save();

                this.choosePair();
                this.displayPair();
            }
        );

        stuckSpan.addEventListener("click", 
            () => {
                this.stuck();
            }
        );

        overrideSpan.addEventListener("click", 
            () => {
                this.override();
            }
        );

        resetSpan.addEventListener("click",
            () => {
                this.reset();
            }
        )

        window.addEventListener("resize",
            () => {
                progressOutlineDiv.style.width = (window.innerWidth * 0.8) + "px";
                this.displayProgress();
            }
        );
        
        document.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                if (!this.importedSet) {
                    this.importSet();
                } else if (!this.formattedSet) {
                    this.formatSet();
                } else if (!this.namedSet) {
                    this.nameSet();
                } else {
                    if (!this.enterCooldown) {
                        this.submitAnswer();
                    }
                }
            }
        });
    }

    importSet() {
        let setString = definitionInput.value;

        if (setString.slice(0, 10) === "//recall//") {
            definitionInput.value = "";

            setString = setString.split("");
            setString.splice(0, 10);
            setString = setString.join("");
            this.load(setString);

            this.importedSet = true;
        } else if (setString === "//listSets//") {
            definitionInput.value = "";

            let outputString = "";
            let keyIndex = 0;
            while (localStorage.key(keyIndex) !== null) {
                outputString += localStorage.key(keyIndex) + "<br />";
                keyIndex += 1;
            }
            outputString += "<br />Use //recall//NAME to retrieve any of these sets.";
            termSpan.innerHTML = outputString;
        } else {
            termSpan.innerHTML = "How do you want to answer the questions?<br />Type definition to answer by definition.<br />Type term to answer by term.<br />Type both to answer by both.";
            definitionInput.value = "";

            let stringArray = setString.split("/////");
            if (stringArray.length === 1) {
                console.log("invalid at stringArray");
                termSpan.innerHTML = "Invalid text.";
                return;
            }
            let stringPairs = [];
            for (let i = 0; i < stringArray.length; i++) {
                stringPairs[i] = stringArray[i].split("///");
            }
        
            if (stringPairs[stringPairs.length - 1][0] === "") {
                stringPairs.splice(stringPairs.length -1, 1);
            }

            for (let i = 0; i < stringPairs.length; i++) {
                if (stringPairs[i].length === 1) {
                    console.log("invalid at stringPairs");
                    console.log(stringPairs[i]);
                    termSpan.innerHTML = "Invalid text.<br />Check to make sure that every definition has text.";
                    return;
                }
            }
            console.log(stringPairs);
            this.stringPairs = stringPairs;

            

            this.importedSet = true;
        }
    }

    formatSet() {
        termSpan.innerHTML = "Write a name for the set in the space below.";
        let answer = definitionInput.value;
        definitionInput.value = "";

        if (answer === "definition") {
            for (let i = 0; i < this.stringPairs.length; i++) {
                this.set.push(new Pair(this.stringPairs[i][0], this.stringPairs[i][1]));
            }
            this.formattedSet = true;
        } else if (answer === "term") {
            for (let i = 0; i < this.stringPairs.length; i++) {
                this.set.push(new Pair(this.stringPairs[i][1], this.stringPairs[i][0]));
            }
            this.formattedSet = true;
        } else if (answer === "both") {
            for (let i = 0; i < this.stringPairs.length; i++) {
                this.set.push(new Pair(this.stringPairs[i][0], this.stringPairs[i][1]));
                this.set.push(new Pair(this.stringPairs[i][1], this.stringPairs[i][0]));
            }
            this.formattedSet = true;
        }
    }

    nameSet() {
        this.name = definitionInput.value;
        this.namedSet = true;
        this.start();
    }

    save() {
        localStorage.setItem(this.name, JSON.stringify(this.set));
    }

    load(name) {
        this.name = name;
        this.set = JSON.parse(localStorage.getItem(name));

        this.namedSet = true;
        this.formattedSet = true;
        this.start();
    }

    start() {
        this.save();

        this.totalProgress = this.set.length * 2;

        this.startDisplay();
        this.displayProgress();
        this.choosePair();
        this.displayPair();
    }

    choosePair() {
        let scoreSum = 0; // number
        for (let i = 0; i < this.set.length; i++) {
            scoreSum += (this.set[i].score * -1);
        }
        
        if (scoreSum > 0) {
            let randomSelection = Math.floor(Math.random() * scoreSum); // number
            let runningSum = 0;
            for (let i = 0; i < this.set.length; i++) {
                runningSum += (this.set[i].score * -1);
                if (runningSum > randomSelection) {
                    this.currentPair = this.set[i];
                    this.currentPairIndex = i;
                    break;
                }
            }
        } else {
            let randomIndex = Math.floor(Math.random() * this.set.length);
            this.currentPair = this.set[randomIndex];
            this.currentPairIndex = randomIndex;
        }
        
        console.log(this.currentPair);

        if (this.currentPair.score >= -1) {
            this.currentMode = "Writing";
        } else {
            this.currentMode = "Choices";
        }
    }
    
    displayPair() {
        this.displayTerm();

        correctDefinitionSpan.style.display = "none";
        nextSpan.style.display = "none";
        overrideSpan.style.display = "none";


        if (this.currentMode === "Writing") {
            this.displayWriting();
        } else if (this.currentMode === "Choices") {
            this.displayChoices();
        }
    }

    displayTerm() {
        termSpan.innerHTML = this.currentPair.term;
        definitionInput.value = "";
    }

    displayChoices() {
        definitionInput.style.display = "none";
        choiceDiv.style.display = "flex";

        for (let i = 0; i < choiceDiv.children.length; i++) {
            let randomIndex = 0; // number
            randomIndex = Math.floor(Math.random() * this.set.length);
            while (randomIndex === this.currentPairIndex) {
                randomIndex = Math.floor(Math.random() * this.set.length);
            }

            if (randomIndex === this.currentPairIndex) {
                console.log("[WARNING]");
            }

            let randomPair = this.set[randomIndex];
            choiceDiv.children.item(i).innerHTML = randomPair.definition;
        }

        let randomChildIndex = Math.floor(Math.random() * choiceDiv.children.length);
        this.currentChoice = randomChildIndex;
        choiceDiv.children.item(randomChildIndex).innerHTML = this.currentPair.definition;
    }

    displayWriting() {
        definitionInput.style.display = "block";
        choiceDiv.style.display = "none";
    }

    submitAnswer(choiceItem) {
        // choiceItem: number

        if (this.currentMode === "Choices") {
            this.submitChoices(choiceItem);
        } else if (this.currentMode === "Writing") {
            this.submitWriting();
        } else {
            console.log("[WARNING]");
        }

        this.displayProgress();
        this.save();
    }

    submitChoices(choiceItem) {
        if (choiceItem === this.currentChoice) {
            if (!this.cheated) {
                this.currentPair.score += 1;
            } else {
                this.currentPair.score -= 1;
            }
            this.cheated = false;

            choiceBackgroundColors[choiceItem][0] = 0;
            choiceBackgroundColors[choiceItem][2] = 0;
            updateBorderColor();

            this.choosePair();

            this.clickCooldown = true;
            window.setTimeout(
                () => {
                    this.displayPair();
                    this.clickCooldown = false;
                },
                500
            );
        } else {
            this.currentPair.score -= 1;

            choiceBackgroundColors[choiceItem][1] = 0;
            choiceBackgroundColors[choiceItem][2] = 0;
            choiceBackgroundColors[this.currentChoice][0] = 0;
            choiceBackgroundColors[this.currentChoice][2] = 0;
            updateBorderColor();

            this.choosePair();

            this.clickCooldown = true;
            window.setTimeout(
                () => {
                    this.displayPair();
                    this.clickCooldown = false;
                },
                1000
            );
            updateBorderColor();
        }
    }

    submitWriting() {
        let answer = definitionInput.value;
        if (answer === "") {
            return;
        }
        definitionInput.value = "";
        if (answer === this.currentPair.definition) {
            if (!this.cheated) {
                this.currentPair.score += 1;
            } else {
                this.currentPair.score -= 1;
            }
            this.cheated = false;

            definitionInputBorderColor[1] = 255;
            updateBorderColor();

            this.choosePair();
            this.enterCooldown = true;
            window.setTimeout(
                () => {
                    this.displayPair();
                    this.enterCooldown = false;
                },
                500
            );
        } else {
            this.currentPair.score -= 1;

            definitionInput.style.display = "none";
            nextSpan.style.display = "flex";

            overrideSpan.style.display = "flex";
            correctDefinitionSpan.style.display = "block";
            correctDefinitionSpan.innerHTML = "The correct answer was: " + this.currentPair.definition + "<br />Your answer was: " + answer;

            definitionInputBorderColor[0] = 255;
            updateBorderColor();
        }
    }

    override() {
        this.currentPair.score += 2;
        this.cheated = false;

        definitionInputBorderColor[1] = 255;
        updateBorderColor();

        this.choosePair();
        this.enterCooldown = true;
        window.setTimeout(
            () => {
                this.displayPair();
                this.enterCooldown = false;
            },
            500
        );

        this.displayProgress();
        this.save();
    }

    stuck() {
        this.cheated = true;

        if (this.currentMode === "Writing") {
            definitionInput.value = this.currentPair.definition;
        } else if (this.currentMode === "Choices") {
            choiceBackgroundColors[this.currentChoice][0] = 0;
            choiceBackgroundColors[this.currentChoice][2] = 0;
        }
        
        this.displayProgress();
    }

    displayProgress() {
        let scoreSum = 0; // number
        for (let i = 0; i < this.set.length; i++) {
            scoreSum += (this.set[i].score * -1);
        }
    
        if (scoreSum > this.totalProgress) {
            this.totalProgress = scoreSum;
        }
        

        this.progress = 1 - (scoreSum / this.totalProgress);
        let progressPercent = Math.round(this.progress * 1000) / 10;
        progressNumberSpan.innerHTML = progressPercent + "%";

        if (scoreSum < 0) {
            // this means that the user has reached 100%
            progressOutlineDiv.style.width = ((1 / this.progress) * (window.innerWidth * 0.8)) + "px";
            progressOutlineDiv.style.marginLeft = ((window.innerWidth * 0.1) - 2) + "px";
            progressOutlineDiv.style.marginRight = (((window.innerWidth * 0.1) - 2) + ((1 - (1 / this.progress)) * (window.innerWidth * 0.8))) + "px";
            progressDiv.style.width = ((window.innerWidth * 0.8) - 8) + "px";
        } else {
            progressDiv.style.width = (this.progress * ((window.innerWidth * 0.8) - 8)) + "px";
        }
    }

    reset() {
        if (!this.resetConfirmation) {
            resetSpan.innerHTML = "Are you sure?";
            this.resetConfirmation = true;
        } else {
            resetSpan.innerHTML = "Reset Progress";

            for (let i = 0; i < this.set.length; i++) {
                this.set[i].score = -2;
            }

            this.clickCooldown = false;
            this.enterCooldown = false;
    
            this.currentPair = []; // Pair
            this.currentPairIndex = 0; // number
            this.currentChoice = 0; // number
            this.currentMode = "Choices"; // string
    
            this.cheated = false;
    
            this.currentProgress = 0; // number
            this.totalProgress = 0; // number
    
            this.resetConfirmation = false;

            this.start();
        }
    }
}
let session = new Session();

function loop() {
    updateBorderColor();

    if (definitionInputBorderColor[0] > 0) definitionInputBorderColor[0] -= 25.5;
    if (definitionInputBorderColor[1] > 0) definitionInputBorderColor[1] -= 25.5;
    if (definitionInputBorderColor[2] > 0) definitionInputBorderColor[2] -= 25.5;

    for (let i = 0; i < choiceBackgroundColors.length; i++) {
        for (let j = 0; j < choiceBackgroundColors[i].length; j++) {
            if (choiceBackgroundColors[i][j] < 255) {
                choiceBackgroundColors[i][j] += 51;
            }
        }
    }
}
function updateBorderColor() {
    definitionInput.style.borderColor = "rgb(" + definitionInputBorderColor[0] + ", " + definitionInputBorderColor[1] + ", " + definitionInputBorderColor[2] + ")";
    for (let i = 0; i < choiceDiv.children.length; i++) {
        choiceDiv.children.item(i).style.backgroundColor = "rgb(" + choiceBackgroundColors[i][0] + ", " + choiceBackgroundColors[i][1] + ", " + choiceBackgroundColors[i][2] + ")";
    }
}
window.setInterval(loop, 100);