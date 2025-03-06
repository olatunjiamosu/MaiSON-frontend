from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS with explicit settings
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})

@app.route('/hello', methods=['GET'])
def hello_get():
    logger.info(f"GET request to /hello received from {request.remote_addr}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    response = jsonify({"message": "Hello from GET!"})
    # Add explicit CORS headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response, 200

@app.route('/hello', methods=['POST'])
def hello_post():
    logger.info(f"POST request to /hello received from {request.remote_addr}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    response = jsonify({"message": "Hello from POST!"})
    # Add explicit CORS headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response, 200

@app.route('/hello', methods=['OPTIONS'])
def hello_options():
    logger.info(f"OPTIONS request to /hello received from {request.remote_addr}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    response = jsonify({"message": "CORS preflight handled"})
    # Add explicit CORS headers
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response, 200

if __name__ == '__main__':
    logger.info("Starting simple server on port 8000")
    app.run(host='0.0.0.0', port=8000, debug=True) 