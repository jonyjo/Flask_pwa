from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_compress import Compress


app = Flask(__name__, static_folder="static")
CORS(app)
Compress(app)
# Mock user data
users = {
    "user": {"password": "user", "role": "user"},
    "admin": {"password": "admin", "role": "admin"}
}
@app.route('/')
def index():
    return "Hello, World!"

def authenticate(username, password):
    user = users.get(username)
    if user and user["password"] == password:
        return {"username": username, "role": user["role"]}
    return None

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = authenticate(data["username"], data["password"])
    if user:
        return jsonify({"message": "Login successful", "role": user["role"]}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/classify", methods=["POST"])
def classify():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"message": "Unauthorized"}), 401

    # Check role from authorization token (simplified role in header for demonstration)
    token_role = auth_header.split(" ")[-1]
    if token_role == "user":
        return jsonify({"message": "User role: Access granted to basic classification"}), 200
    elif token_role == "admin":
        return jsonify({"message": "Admin role: Access granted with additional controls"}), 200
    else:
        return jsonify({"message": "Unauthorized role"}), 403

# Serve static files
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5001)
