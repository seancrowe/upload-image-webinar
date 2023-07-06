"use strict";

// CHILI calls OnEditorEvent be default - so we will override it
window.OnEditorEvent = onEditorEvent;

// Storing the selected frame
let selectedFrame;

// Global variable so we only fire off when we are loading and image
let imageLoading;

/**
 * Function is called automatically when an event is fired by the editor (this call is done in main.js of the CHILI editor)
 * @param {string} type 
 * @param {string} targetID 
 */
function onEditorEvent(type, targetID) {

    switch (type) {
        // Is called automatically (no event listner need) when the document is serialized into DOM - however, there is still a lot of initlization
        case "DocumentFullyLoaded":
            console.log("Editor is fully load we can now get the editorObject");
            onEditorLoaded();
            break;

        // Fired when selected frame is changed
        case "SelectedFrameChanged":
            selectedFrameChanged();
            break;
        
        // Fire when any image is finishing loading in a frame
        case "FrameImageCompleted":
            
            console.log("Frame Completed");
            console.log(imageLoading);
            
            if (imageLoading == true) {
                document.getElementById("chili-editor-loader").style.display = "none";
                selectedFrameChanged();
                imageLoading = false;
            }
            
            break;
        
        // Called when the entire Editor done loading - you can use InitialViewRender instead
        case "DocumentFullyRendered":
            // Set Zoom
            editorObject.SetProperty("document", "zoom", 50);
            // Disable scrollbars
            editorObject.SetProperty("editor.controls[0].controls[1]", "scrollBarsVisible", "false");

            document.getElementById("chili-editor-loader").style.display = "none";
            break;
    }
}

/**
 * Function called when DocumentFullyLoaded is completed
 */
function onEditorLoaded() {

    window.editorObject = publisher.editorObject;

    // Add any event listeners
    editorObject.AddListener("DocumentFullyRendered"); // InitialViewRendered is another option
    editorObject.AddListener("SelectedFrameChanged");
    editorObject.AddListener("FrameImageCompleted");
}

/**
 * Function called when SelectedFrameChanged is completed
 */
async function selectedFrameChanged() {
    selectedFrame = await editorObject.GetObject("document.selectedFrame");
    const element = document.getElementById("chili-image-buttons");
    document.getElementById("chili-loading-image-message").style.display = "none";

    if (selectedFrame != null && selectedFrame.type == "image") {

        element.style.display = "flex";
        document.getElementById("chili-image-upload").parentElement.style.display = "block";
        
        if (await getCustomImagePrivateData(selectedFrame.id) == "true") {
            document.getElementById("chili-image-remove").parentElement.style.display = "block";
        }
        else {
            document.getElementById("chili-image-remove").parentElement.style.display = "none";
        }

    }
    else {
            element.style.display = "none"
    }
}

/**
 * Will change settings to show the "Loading Image"
 */
function showImageLoadingMessage() {
    document.getElementById("chili-image-remove").parentElement.style.display = "none"
    document.getElementById("chili-image-upload").parentElement.style.display = "none";
    document.getElementById("chili-loading-image-message").style.display = "block";
}

/**
 * Remove the image from the selected frame
 */
async function removeImage() {

    if (selectedFrame != null && selectedFrame.type == "image") {

        const imageReplace = await editorObject.GetObject("document.variables[ImagePlaceHolder]").imgXML;

        if (selectedFrame.variable != null) {
            editorObject.SetProperty(selectedFrame.variable, "imgXML", imageReplace);
        }
        else {
            editorObject.ExecuteFunction(selectedFrame.javaScriptDescriptor, "LoadContentFromXmlString", imageReplace);
        }

        setCustomImagePrivateData(selectedFrame.id, false);
        selectedFrameChanged();
    }

}

/**
 * Upload image to the CHILI Server
 * @param {*} fileData
 */
function uploadImage(fileData) {
    
    document.getElementById("chili-editor-loader").style.display = "block";
    showImageLoadingMessage();
    imageLoading = true;

    const reader = new FileReader();

    reader.readAsBinaryString(fileData);

    reader.onload = () => {
        const base64String = window.btoa(reader.result);

        const editorUrl = document.getElementById("editor-iframe").src;
        const urlData = stealUrl(editorUrl);

        const date = new Date(Date.now());
        const filePath = "users/" + getUserName() + "/uploads/" + date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
        const uploadUrl = urlData.url + "/rest-api/v1/resources/assets/items?newName=" + encodeURI(fileData.name) + "&folderPath=" + encodeURI(filePath);

        const data = {
            "xml": "",
            "fileData": base64String
        }

        window.SpicyWebService.restCall(JSON.stringify(data), urlData.apiKey, uploadUrl, "POST", "application/json", (status, results) => {
            if (status == 201) {
                //<item name="414_557473137505.jpg" id="06a41358-6cf5-4024-ad7d-135ede4584a4" relativePath="users\endUser\uploads\2020\3\29\414_557473137505.jpg"><fileInfo fileIndexed="2020-04-29T02:34:01" numPages="1" resolution="72" width="604" height="453" fileSize="44.2 Kb"><metaData><item name="Width (px)" value="604" /><item name="Height (px)" value="453" /><item name="Resolution" value="72" /></metaData><boxes /></fileInfo></item>

                if (selectedFrame != null && selectedFrame.type == "image") {

                    if (selectedFrame.variable != null) {
                        editorObject.SetProperty(selectedFrame.variable, "imgXML", results);
                    }
                    else {
                        //editorObject.ExecuteFunction("document.allFrames[" + selectedFrame.id +"]")
                        editorObject.ExecuteFunction(selectedFrame.javaScriptDescriptor, "LoadContentFromXmlString", results);
                    }

                    setCustomImagePrivateData(selectedFrame.id, true);
                    
                }
            }
            else {
                onEditorEvent("FrameImageCompleted");
            }
        });
    }
}


/**
 * Set on the frame with id whether the frame has a uploaded image loaded
 * @param {string} frameId
 * @param {boolean} boolean 
 */
async function setCustomImagePrivateData(frameId, boolean) {
    const customImage = await editorObject.GetObject("document.allFrames[" + frameId +"].privateData[CustomImage].value");

    if (customImage == null) {
        const privateData = await editorObject.ExecuteFunction("document.allFrames[" + frameId +"].privateData", "Add");
    
        editorObject.SetProperty("document.allFrames[" + frameId +"].privateData[" + privateData.id + "]", "tag", "CustomImage");
    }

    editorObject.SetProperty("document.allFrames[" + frameId +"].privateData[CustomImage]", "value", boolean);
}

/**
 * Returns true if the selected frame contains an image
 * @param {string} frameId
 * @returns {boolean}
 */
async function getCustomImagePrivateData(frameId) {
    return editorObject.GetObject("document.allFrames[" + frameId + "].privateData[CustomImage].value");
}

