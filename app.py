from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from bson.objectid import ObjectId
import datetime

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/volunteerlinks"
mongo = PyMongo(app)

# Enable CORS
CORS(app)

# Get the collections
volunteers_collection = mongo.db.volunteers
activities_collection = mongo.db.activities
join_activity_collection = mongo.db.join_activity
reviews_collection = mongo.db.reviews

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not name or not email or not password or not role:
        return jsonify({'message': 'All fields are required'}), 400

    if volunteers_collection.find_one({'email': email}):
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = generate_password_hash(password)

    try:
        volunteers_collection.insert_one({
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': role
        })
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'An error occurred while registering the user', 'error': str(e)}), 500

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or not role:
        return jsonify({'message': 'Email, password, and role are required'}), 400

    user = volunteers_collection.find_one({'email': email})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid password'}), 401

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

    if not name or not location or not date or not description:
        return jsonify({'message': 'All fields are required'}), 400

    try:
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
            activity['_id'] = str(activity['_id'])
            return jsonify(activity), 200
        else:
            return jsonify({'message': 'Activity not found'}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/join_activity', methods=['POST'])
def join_activity():
    data = request.get_json()
    user_id = data.get('user_id')
    activity_id = data.get('activity_id')

    if not user_id or not activity_id:
        return jsonify({'message': 'User ID and Activity ID are required'}), 400

    if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(activity_id):
        return jsonify({'message': 'Invalid User ID or Activity ID format'}), 400

    user = volunteers_collection.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'message': 'User not found'}), 404

    activity = activities_collection.find_one({'_id': ObjectId(activity_id)})
    if not activity:
        return jsonify({'message': 'Activity not found'}), 404

    user_name = user.get('name')
    user_email = user.get('email')
    user_role = user.get('role')

    activity_name = activity.get('name')
    activity_location = activity.get('location')
    activity_date = activity.get('date')

    try:
        join_activity_collection.insert_one({
            'user_id': user_id,
            'user_name': user_name,
            'user_email': user_email,
            'user_role': user_role,
            'activity_id': activity_id,
            'activity_name': activity_name,
            'activity_location': activity_location,
            'activity_date': activity_date,
            'joined_at': datetime.datetime.utcnow()
        })
        return jsonify({'message': 'Activity joined successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'An error occurred while joining the activity', 'error': str(e)}), 500

@app.route('/api/add_review', methods=['POST'])
def add_review():
    data = request.get_json()
    text = data.get('text')
    date = data.get('date')
    rating = data.get('rating')
    activity_id = data.get('activity_id')

    if not text or not date or rating is None or not activity_id:
        return jsonify({'message': 'All fields are required'}), 400

    if not ObjectId.is_valid(activity_id):
        return jsonify({'message': 'Invalid Activity ID format'}), 400

    try:
        reviews_collection.insert_one({
            'text': text,
            'date': date,
            'rating': rating,
            'activity_id': ObjectId(activity_id)
        })
        return jsonify({'message': 'Review added successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'An error occurred while adding the review', 'error': str(e)}), 500

@app.route('/api/get_reviews', methods=['GET'])
def get_reviews():
    activity_id = request.args.get('activityId')

    if not activity_id or not ObjectId.is_valid(activity_id):
        return jsonify({'message': 'Invalid Activity ID format'}), 400

    try:
        reviews = list(reviews_collection.find({'activity_id': ObjectId(activity_id)}))
        for review in reviews:
            review['_id'] = str(review['_id'])
            review['activity_id'] = str(review['activity_id'])  # Optional: Convert activity_id to string
        return jsonify({'reviews': reviews}), 200
    except Exception as e:
        return jsonify({'message': 'An error occurred while fetching reviews', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
