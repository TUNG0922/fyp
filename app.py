from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from bson.objectid import ObjectId

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/volunteerlinks"
mongo = PyMongo(app)

# Enable CORS
CORS(app)

# Get the volunteers and activities collections
volunteers_collection = mongo.db.volunteers
activities_collection = mongo.db.activities

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    # Validate input
    if not name or not email or not password or not role:
        return jsonify({'message': 'All fields are required'}), 400

    # Check if user already exists
    if volunteers_collection.find_one({'email': email}):
        return jsonify({'message': 'User already exists'}), 400

    # Hash the password before storing it
    hashed_password = generate_password_hash(password)

    # Insert new user into the database
    try:
        volunteers_collection.insert_one({
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': role
        })
    except Exception as e:
        return jsonify({'message': 'An error occurred while registering the user', 'error': str(e)}), 500

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    # Validate input
    if not email or not password or not role:
        return jsonify({'message': 'Email, password, and role are required'}), 400

    # Find the user by email
    user = volunteers_collection.find_one({'email': email})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Check if the provided password matches the stored hash
    if not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid password'}), 401

    # Check if the provided role matches the user's role
    if user['role'] != role:
        return jsonify({'message': 'Role mismatch'}), 403

    return jsonify({'message': 'Sign-in successful', 'role': user['role']}), 200

@app.route('/api/add_activity', methods=['POST'])
def add_activity():
    data = request.json
    name = data.get('name')
    location = data.get('location')
    date = data.get('date')
    description = data.get('description')
    imageUri = data.get('imageUri')

    # Validate input
    if not name or not location or not date or not description:
        return jsonify({'message': 'All fields are required'}), 400

    try:
        # Save the activity to MongoDB
        activities_collection.insert_one({
            'name': name,
            'location': location,
            'date': date,
            'description': description,
            'imageUri': imageUri
        })

        return jsonify({"message": "Activity added successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/activities', methods=['GET'])
def get_activities():
    try:
        activities = list(activities_collection.find())
        for activity in activities:
            activity['_id'] = str(activity['_id'])
        return jsonify(activities), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/activity/<activity_id>', methods=['GET'])
def get_activity(activity_id):
    try:
        if not ObjectId.is_valid(activity_id):
            return jsonify({'message': 'Invalid activity ID'}), 400

        activity = activities_collection.find_one({'_id': ObjectId(activity_id)})
        if activity:
            # Convert ObjectId to string
            activity['_id'] = str(activity['_id'])
            return jsonify(activity), 200
        else:
            return jsonify({'message': 'Activity not found'}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
