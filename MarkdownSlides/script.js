var storageKey = "mySlides";

var defaultSlides =
    "# Slide 01\n" +
    "## A new plan before lunch\n\n" +
    "content\n\n" +
    "---\n\n" +
    "# Slide 02\n" +
    "## Early commuter will shape a better routine \n\n" +
    "content\n\n" +
    "---\n\n" +
    "# Slide 03\n\n" +
    "So on...";

var currentSlide = 0;
var currentScreen = "edit";

var editor = document.getElementById("editor");
var status = document.getElementById("status");
var editScreen = document.getElementById("editScreen");
var presentScreen = document.getElementById("presentScreen");

var savedSlides = localStorage.getItem(storageKey);

if (savedSlides !== null) {
    editor.value = savedSlides;
} else {
    editor.value = defaultSlides;
}

function getSlides() {
    var parts = editor.value.split(/^\s*---\s*$/m);
    var slides = [];

    for (var i = 0; i < parts.length; i++) {
        if (parts[i].trim() !== "") {
            slides.push(parts[i].trim());
        }
    }

    if (slides.length === 0) {
        slides.push("");
    }

    return slides;
}

function showSlide() {
    var slides = getSlides();

    if (currentSlide >= slides.length) {
        currentSlide = slides.length - 1;
    }

    if (currentSlide < 0) {
        currentSlide = 0;
    }

    var slideHTML;

    if (typeof marked !== "undefined" && marked.parse) {
        slideHTML = marked.parse(slides[currentSlide]);
    } else {
        slideHTML = "<p>Markdown library could not load. Check your internet connection.</p>";
    }

    var slideBoxes = document.querySelectorAll(".slide-content");
    var counts = document.querySelectorAll(".count");
    var prevButtons = document.querySelectorAll(".prev");
    var nextButtons = document.querySelectorAll(".next");
    var fullScreenButtons = document.querySelectorAll(".fs");

    for (var i = 0; i < slideBoxes.length; i++) {
        slideBoxes[i].innerHTML = slideHTML;
        counts[i].textContent = (currentSlide + 1) + " / " + slides.length;
        prevButtons[i].disabled = currentSlide === 0;
        nextButtons[i].disabled = currentSlide === slides.length - 1;

        if (document.fullscreenElement) {
            fullScreenButtons[i].textContent = "Exit Full Screen";
        } else {
            fullScreenButtons[i].textContent = "Full Screen";
        }
    }
}

function goNext() {
    if (currentSlide < getSlides().length - 1) {
        currentSlide++;
        showSlide();
    }
}

function goPrev() {
    if (currentSlide > 0) {
        currentSlide--;
        showSlide();
    }
}

function toggleFullScreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
    }

    var viewer;

    if (currentScreen === "edit") {
        viewer = document.getElementById("viewerEdit");
    } else {
        viewer = document.getElementById("viewerPresent");
    }

    if (viewer.requestFullscreen) {
        viewer.requestFullscreen();
    }
}

function saveSlides() {
    try {
        localStorage.setItem(storageKey, editor.value);
        textContent = " Saved!";
    } catch (error) {
        textContent = " Could not save in this browser.";
    }
}

function showScreen(screenName) {
    currentScreen = screenName;

    if (document.fullscreenElement) {
        document.exitFullscreen();
    }

    if (screenName === "edit") {
        editScreen.hidden = false;
        presentScreen.hidden = true;
        editScreen.style.display = "flex";
    } else {
        editScreen.hidden = true;
        presentScreen.hidden = false;
    }

    showSlide();
}

document.getElementById("createBtn").onclick = function () {
    editor.value = defaultSlides;
    currentSlide = 0;
    textContent = "";
    showScreen("edit");
};

document.getElementById("editBtn").onclick = function () {
    showScreen("edit");
};

document.getElementById("presentBtn").onclick = function () {
    showScreen("present");
};

document.getElementById("saveBtn").onclick = saveSlides;

var prevButtons = document.querySelectorAll(".prev");
var nextButtons = document.querySelectorAll(".next");
var fullScreenButtons = document.querySelectorAll(".fs");

for (var i = 0; i < prevButtons.length; i++) {
    prevButtons[i].onclick = goPrev;
    nextButtons[i].onclick = goNext;
    fullScreenButtons[i].onclick = toggleFullScreen;
}

editor.addEventListener("input", function () {
    textContent = "";
    currentSlide = Math.min(currentSlide, getSlides().length - 1);
    showSlide();
});

document.addEventListener("fullscreenchange", showSlide);

document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveSlides();
        return;
    }

    if (event.key === "F11") {
        event.preventDefault();
        toggleFullScreen();
        return;
    }

    if (event.target === editor || event.target.isContentEditable) {
        return;
    }

    if (event.key === "ArrowRight") {
        goNext();
    } else if (event.key === "ArrowLeft") {
        goPrev();
    }
});

showSlide();
