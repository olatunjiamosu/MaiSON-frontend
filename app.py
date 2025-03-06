from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import psycopg2
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Get database connection parameters from environment variables
db_host = os.environ.get('DB_HOST', 'postgres')
db_name = os.environ.get('DB_NAME', 'property_viewings')
db_user = os.environ.get('DB_USER', 'postgres')
db_password = os.environ.get('DB_PASSWORD', 'postgres')
db_port = os.environ.get('DB_PORT', '5432')

# Determine if we should use SSL based on the host
# For local development (localhost, postgres), we don't need SSL
local_hosts = ['localhost', '127.0.0.1', 'postgres']
use_ssl = db_host not in local_hosts

# Construct the database URL with appropriate SSL setting
if use_ssl:
    DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?sslmode=require"
    print(f"Connecting to database with SSL: {db_host}:{db_port}/{db_name} as {db_user}")
else:
    DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?sslmode=disable"
    print(f"Connecting to database without SSL: {db_host}:{db_port}/{db_name} as {db_user}")

def get_db_connection():
    # Create connection with appropriate SSL mode
    if use_ssl:
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=db_port,
            sslmode='require'
        )
    else:
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password,
            port=db_port,
            sslmode='disable'
        )
    conn.autocommit = True
    return conn

@app.route('/basic-test', methods=['GET'])
def basic_test():
    return jsonify({
        "message": "Basic test endpoint works",
        "success": True,
        "method": request.method,
        "dummy_property": {
            "id": "927d5358-fb96-46fc-8684-29041db993f2",
            "name": "Basic Test Property"
        }
    })

@app.route('/api/test-create', methods=['POST'])
def test_create():
    try:
        print("Starting test_create endpoint")
        # Create a test property
        conn = get_db_connection()
        print("Database connection established")
        cur = conn.cursor()
        
        print("Creating tables if they don't exist...")
        # Check if tables exist, if not create them
        cur.execute("""
        CREATE TABLE IF NOT EXISTS properties (
            id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("Properties table checked/created")
        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS sellers (
            id UUID PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            firebase_uid VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("Sellers table checked/created")
        
        cur.execute("""
        CREATE TABLE IF NOT EXISTS availability (
            id SERIAL PRIMARY KEY,
            property_id UUID REFERENCES properties(id),
            seller_id UUID REFERENCES sellers(id),
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("Availability table checked/created")
        
        # Generate a UUID for the property
        import uuid
        property_id = str(uuid.uuid4())
        seller_id = str(uuid.uuid4())
        
        print(f"Generated IDs - Property: {property_id}, Seller: {seller_id}")
        
        # Insert a test property
        cur.execute(
            "INSERT INTO properties (id, name) VALUES (%s, %s) RETURNING id",
            (property_id, "Test Property")
        )
        print("Test property inserted")
        
        # Insert a test seller
        seller_name = f"Test Seller {seller_id[:8]}"
        firebase_uid = None  # Default to None if no JSON body
        
        if request.get_json():
            firebase_uid = request.json.get('firebase_uid')
        
        cur.execute(
            "INSERT INTO sellers (id, name, firebase_uid) VALUES (%s, %s, %s) RETURNING id",
            (seller_id, seller_name, firebase_uid)
        )
        print("Test seller inserted")
        
        cur.close()
        conn.close()
        print("Database connection closed")
        
        return jsonify({
            "message": "Test property created successfully",
            "next_steps": [
                f"Visit: /seller-dashboard/property/{property_id}/availability",
                "Use this ID for testing availability endpoints"
            ],
            "property": {
                "id": property_id,
                "name": "Test Property",
                "seller": {
                    "id": seller_id,
                    "name": seller_name
                }
            }
        }), 201
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in test_create: {str(e)}")
        print(f"Traceback: {error_details}")
        return jsonify({
            "error": str(e),
            "details": error_details
        }), 500

@app.route('/api/property/<property_id>', methods=['GET'])
def get_property(property_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get property details
        cur.execute(
            """
            SELECT p.id, p.name, 
                  (SELECT COUNT(*) FROM availability a WHERE a.property_id = p.id) as availability_count
            FROM properties p
            WHERE p.id = %s
            """,
            (property_id,)
        )
        
        property_data = cur.fetchone()
        
        if not property_data:
            return jsonify({"error": "Property not found"}), 404
            
        cur.close()
        conn.close()
        
        return jsonify({
            "id": property_data[0],
            "name": property_data[1],
            "availability_count": property_data[2]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/availability/property/<property_id>', methods=['GET'])
def get_availability(property_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get availability slots for property
        cur.execute(
            """
            SELECT id, property_id, seller_id, start_time, end_time
            FROM availability
            WHERE property_id = %s
            ORDER BY start_time
            """,
            (property_id,)
        )
        
        slots = []
        for row in cur.fetchall():
            slots.append({
                "id": row[0],
                "property_id": row[1],
                "seller_id": row[2],
                "start_time": row[3].isoformat(),
                "end_time": row[4].isoformat()
            })
            
        cur.close()
        conn.close()
        
        return jsonify(slots)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/availability', methods=['POST'])
def create_availability():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['property_id', 'seller_id', 'start_time', 'end_time']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Parse datetime strings
        try:
            start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"error": "Invalid datetime format"}), 400
        
        # Validate time range
        if end_time <= start_time:
            return jsonify({"error": "End time must be after start time"}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Insert availability slot
        cur.execute(
            """
            INSERT INTO availability (property_id, seller_id, start_time, end_time)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (data['property_id'], data['seller_id'], start_time, end_time)
        )
        
        slot_id = cur.fetchone()[0]
        
        # Get the created slot
        cur.execute(
            """
            SELECT id, property_id, seller_id, start_time, end_time
            FROM availability
            WHERE id = %s
            """,
            (slot_id,)
        )
        
        row = cur.fetchone()
        slot = {
            "id": row[0],
            "property_id": row[1],
            "seller_id": row[2],
            "start_time": row[3].isoformat(),
            "end_time": row[4].isoformat()
        }
        
        cur.close()
        conn.close()
        
        return jsonify(slot), 201
        
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/availability/<int:slot_id>', methods=['DELETE'])
def delete_availability(slot_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if slot exists
        cur.execute("SELECT id FROM availability WHERE id = %s", (slot_id,))
        if not cur.fetchone():
            return jsonify({"error": "Availability slot not found"}), 404
        
        # Delete the slot
        cur.execute("DELETE FROM availability WHERE id = %s", (slot_id,))
        
        cur.close()
        conn.close()
        
        return jsonify({"message": "Availability slot deleted successfully"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)