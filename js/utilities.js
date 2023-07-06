"use strict";

/**
 * A shell function to get the username - in real life do something cool
 */
function getUserName() {
    return "sean-webinar-2020";
}

/**
 * Steal the URL, API key, and the environment from the provided editor URL
 * @param {string} editorUrl 
 */
function stealUrl(editorUrl) {

    const url = editorUrl;

    let params = {};
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        params[key] = value;
    });

    let indexOfEditor = url.indexOf("editor") - 1;

    let smallUrl = url.slice(0, indexOfEditor);

    let indexOfSlash = smallUrl.lastIndexOf("/") + 1;

    let returnValues = {
        "url": smallUrl.slice(0, indexOfSlash),
        "environment": smallUrl.slice(indexOfSlash, smallUrl.length),
        "apiKey": params["apiKey"]
    };

    return returnValues;
};

/**
 * Launch browser image selection and send the formDate to the callBackFunction
 * @param {function} callBackFunction 
 */
function imageSelection(callBackFunction) {

    let inputNode = document.getElementById("chili-input-upload");

    // Fire when input node is changed - user has selected image
    inputNode.addEventListener("change", () => {
        if (inputNode.files[0] != null) {

            if (callBackFunction != null && typeof callBackFunction == "function") {
                callBackFunction(inputNode.files[0]);
            }

        }
    }, false);

    // Click node to open up file browser
    inputNode.click();
}

/**
 * Deselect the frame if clicking outside the Editor
 */
function deselectFrame() {
    if (window.editorObject != null) {
        editorObject.SetProperty("document", "selectedFrame", null);

    }
}

