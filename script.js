const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const resultsDiv =
    document.getElementById("results");

const loading =
    document.getElementById("loading");

const tabs =
    document.querySelectorAll(".tab");


let currentMode = "all";


// ------------------------------------
// SEARCH BUTTON
// ------------------------------------

searchButton.addEventListener(
    "click",
    performSearch
);


// ------------------------------------
// ENTER KEY
// ------------------------------------

searchInput.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            performSearch();

        }

    }
);


// ------------------------------------
// TABS
// ------------------------------------

tabs.forEach(
    function(tab) {

        tab.addEventListener(
            "click",
            function() {

                tabs.forEach(
                    t => t.classList.remove("active")
                );

                tab.classList.add("active");

                currentMode =
                    tab.dataset.mode;

                performSearch();

            }
        );

    }
);


// ------------------------------------
// MAIN SEARCH FUNCTION
// ------------------------------------

async function performSearch() {

    const query =
        searchInput.value.trim();


    if (!query) {

        resultsDiv.innerHTML =
            '<div class="empty">Please enter something to search.</div>';

        return;

    }


    loading.style.display = "block";

    resultsDiv.innerHTML = "";


    try {

        const response =
            await fetch(
                `/search?q=${encodeURIComponent(query)}&mode=${currentMode}`
            );


        const data =
            await response.json();


        loading.style.display = "none";


        if (data.error) {

            resultsDiv.innerHTML =
                `<div class="empty">
                    ${data.error}
                 </div>`;

            return;

        }


        displayResults(data);


    }

    catch (error) {

        loading.style.display = "none";

        console.error(error);

        resultsDiv.innerHTML =
            `<div class="empty">
                Something went wrong. Please try again.
             </div>`;

    }

}


// ------------------------------------
// DISPLAY RESULTS
// ------------------------------------

function displayResults(data) {


    let html = "";


    // AI ANSWER

    if (
        data.ai_answer &&
        currentMode === "all"
    ) {

        html += `

            <div class="ai-box">

                <div class="ai-title">

                    ✨ Quick Answer

                </div>

                <div class="ai-text">

                    ${escapeHTML(data.ai_answer)}

                </div>

            </div>

        `;

    }


    // WEB RESULTS

    if (
        data.web_results &&
        data.web_results.length > 0
    ) {

        html += `

            <h2 style="margin-top:35px;">
                Web Results
            </h2>

        `;


        data.web_results.forEach(
            function(result) {

                html += `

                    <div class="result">

                        <a
                            class="result-title"
                            href="${result.link}"
                            target="_blank"
                        >

                            ${escapeHTML(result.title)}

                        </a>


                        <div class="result-url">

                            ${escapeHTML(
                                result.displayed_link ||
                                result.link
                            )}

                        </div>


                        <div class="result-snippet">

                            ${escapeHTML(
                                result.snippet
                            )}

                        </div>

                    </div>

                `;

            }
        );

    }


    // IMAGES

    if (
        data.images &&
        data.images.length > 0
    ) {

        html += `

            <h2 style="margin-top:40px;">
                Images
            </h2>

            <div class="image-grid">

        `;


        data.images.forEach(
            function(image) {

                html += `

                    <a
                        class="image-card"
                        href="${image.link}"
                        target="_blank"
                    >

                        <img
                            src="${image.image}"
                            alt="${escapeHTML(image.title)}"
                            loading="lazy"
                        >

                        <div class="image-info">

                            ${escapeHTML(
                                image.title
                            )}

                        </div>

                    </a>

                `;

            }
        );


        html += `</div>`;

    }


    // WIKIPEDIA

    if (
        data.wikipedia &&
        data.wikipedia.length > 0
    ) {

        html += `

            <h2 style="margin-top:40px;">
                Wikipedia
            </h2>

        `;


        data.wikipedia.forEach(
            function(item) {

                html += `

                    <div class="wiki-card">

                        <div class="wiki-title">

                            ${escapeHTML(
                                item.title
                            )}

                        </div>


                        <div class="wiki-summary">

                            ${escapeHTML(
                                item.summary
                            )}

                        </div>


                        <a
                            class="wiki-link"
                            href="${item.link}"
                            target="_blank"
                        >

                            Read more on Wikipedia →

                        </a>

                    </div>

                `;

            }
        );

    }


    if (!html) {

        html = `

            <div class="empty">

                No results found.

            </div>

        `;

    }


    resultsDiv.innerHTML = html;

}


// ------------------------------------
// SECURITY
// ------------------------------------

function escapeHTML(text) {

    if (!text) return "";

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}