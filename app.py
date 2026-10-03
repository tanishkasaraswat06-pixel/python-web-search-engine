from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import serpapi
import wikipedia

# Load .env
load_dotenv()

app = Flask(__name__)

# Get SerpApi API key
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

# Create SerpApi client
client = serpapi.Client(api_key=SERPAPI_KEY)


# --------------------------------------------------
# GOOGLE WEB SEARCH
# --------------------------------------------------

def google_search(query):
    try:
        results = client.search({
            "engine": "google",
            "q": query,
            "location": "India",
            "hl": "en",
            "gl": "in",
            "num": 10
        })

        organic_results = results.get("organic_results", [])

        output = []

        for result in organic_results:
            output.append({
                "title": result.get("title", ""),
                "link": result.get("link", ""),
                "snippet": result.get("snippet", ""),
                "displayed_link": result.get("displayed_link", "")
            })

        return output

    except Exception as e:
        print("Google search error:", e)
        return []


# --------------------------------------------------
# GOOGLE IMAGE SEARCH
# --------------------------------------------------

def image_search(query):
    try:
        results = client.search({
            "engine": "google_images",
            "q": query,
            "hl": "en",
            "gl": "in"
        })

        image_results = results.get("images_results", [])

        output = []

        for result in image_results[:20]:
            image_url = result.get("original") or result.get("thumbnail")

            if image_url:
                output.append({
                    "title": result.get("title", ""),
                    "image": image_url,
                    "source": result.get("source", ""),
                    "link": result.get("link", "")
                })

        return output

    except Exception as e:
        print("Image search error:", e)
        return []


# --------------------------------------------------
# WIKIPEDIA SEARCH
# --------------------------------------------------

def wikipedia_search(query):
    try:

        search_results = wikipedia.search(query)

        output = []

        for title in search_results[:5]:

            try:
                page = wikipedia.page(
                    title,
                    auto_suggest=False
                )

                output.append({
                    "title": page.title,
                    "summary": page.summary[:500],
                    "link": page.url
                })

            except Exception:
                continue

        return output

    except Exception as e:
        print("Wikipedia error:", e)
        return []


# --------------------------------------------------
# AI-STYLE ANSWER
# --------------------------------------------------

def get_ai_answer(query, web_results):

    if not web_results:
        return "Sorry, I could not find enough information for this query."

    snippets = []

    for result in web_results[:3]:

        snippet = result.get("snippet", "")

        if snippet:
            snippets.append(snippet)

    if not snippets:
        return "Here are some search results related to your query."

    answer = " ".join(snippets)

    # Limit length
    if len(answer) > 700:
        answer = answer[:700] + "..."

    return answer


# --------------------------------------------------
# HOME PAGE
# --------------------------------------------------

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# --------------------------------------------------
# SEARCH API
# --------------------------------------------------

@app.route("/search")
def search():

    query = request.args.get("q", "").strip()

    mode = request.args.get(
        "mode",
        "all"
    )

    if not query:

        return jsonify({
            "error": "Please enter a search query."
        })


    web_results = []
    images = []
    wikipedia_results = []
    ai_answer = ""


    # ALL
    if mode == "all":

        web_results = google_search(query)

        images = image_search(query)

        wikipedia_results = wikipedia_search(query)

        ai_answer = get_ai_answer(
            query,
            web_results
        )


    # WEB
    elif mode == "web":

        web_results = google_search(query)


    # IMAGES
    elif mode == "images":

        images = image_search(query)


    # WIKIPEDIA
    elif mode == "wikipedia":

        wikipedia_results = wikipedia_search(query)


    return jsonify({

        "query": query,

        "mode": mode,

        "ai_answer": ai_answer,

        "web_results": web_results,

        "images": images,

        "wikipedia": wikipedia_results

    })


# --------------------------------------------------
# RUN APPLICATION
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        debug=True
    )