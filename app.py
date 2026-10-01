import os
from flask import Flask, render_template, jsonify, request, make_response

app = Flask(__name__)

# Production-friendly defaults.
app.config.update(
    SEND_FILE_MAX_AGE_DEFAULT=31536000,
    TEMPLATES_AUTO_RELOAD=os.getenv("FLASK_ENV") == "development",
)


@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    )
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"

    # Keep CSP compatible with the current vanilla-JS app and PWA.
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; "
        "font-src 'self' data:; "
        "connect-src 'self'; "
        "manifest-src 'self'; "
        "worker-src 'self'; "
        "base-uri 'self'; "
        "form-action 'self'; "
        "frame-ancestors 'self'"
    )
    return response


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/health")
def health():
    return jsonify(
        status="ok",
        service="chess-academy",
        version="2.0",
    )


@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api/"):
        return jsonify(error="Not found"), 404
    return make_response(render_template("index.html"), 404)


@app.errorhandler(500)
def server_error(error):
    if request.path.startswith("/api/"):
        return jsonify(error="Internal server error"), 500
    return make_response("Internal server error", 500)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG") == "1")
