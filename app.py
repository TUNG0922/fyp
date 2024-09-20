from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from bson.objectid import ObjectId
import datetime

app = Flask(__name__)

# Update the MongoDB URI to include your database name
app.config["MONGO_URI"] = "mongodb+srv://tungjinyou:O1sVhWFc79iEyxSz@cluster0.ufrs5.mongodb.net/volunteerlinks?retryWrites=true&w=majority"
mongo = PyMongo(app)

# Check connection to MongoDB
try:
    mongo.db.command("ping")
    print("Successfully connected to MongoDB!")
except Exception as e:
    print("Failed to connect to MongoDB:", e)

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

    return jsonify({
        'message': 'Sign-in successful',
        'userId': str(user['_id']),
        'username': user['name'],
        'role': user['role']
    }), 200

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
    name = data.get('name')  # Get the name from the request data

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

    existing_join = join_activity_collection.find_one({'user_id': user_id, 'activity_id': activity_id})
    if existing_join:
        return jsonify({'message': 'You have already joined the activity'}), 400

    # Save the join activity with the user's name
    join_activity_data = {
        'user_id': user_id,
        'activity_id': activity_id,
        'name': name,  # Save the user's name
        'joined_at': datetime.datetime.utcnow()  # Save the current time as join time
    }

    join_activity_collection.insert_one(join_activity_data)

    return jsonify({'message': 'You have successfully joined the activity'}), 200

@app.route('/api/check_join_status', methods=['POST'])
def check_join_status():
    data = request.get_json()
    user_id = data.get('user_id')
    activity_id = data.get('activity_id')

    if not user_id or not activity_id:
        return jsonify({'message': 'User ID and Activity ID are required'}), 400

    if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(activity_id):
        return jsonify({'message': 'Invalid User ID or Activity ID format'}), 400

    try:
        join_record = join_activity_collection.find_one({'user_id': user_id, 'activity_id': activity_id})

        if join_record:
            return jsonify({'hasJoined': True}), 200
        else:
            return jsonify({'hasJoined': False}), 200
    except Exception as e:
        return jsonify({'message': 'An error occurred while checking join status', 'error': str(e)}), 500

@app.route('/api/add_review', methods=['POST'])
def add_review():
    data = request.json
    new_review = {
        "text": data.get('text'),
        "date": data.get('date'),
        "rating": data.get('rating'),
        "activity_id": data.get('activity_id'),
        "user_id": data.get('user_id'),  # Save user_id
        "name": data.get('name'),        # Save name
    }
    
    # Save to MongoDB
    try:
        result = mongo.db.reviews.insert_one(new_review)
        return jsonify({"success": True, "review_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/get_reviews', methods=['GET'])
def get_reviews():
    activity_id = request.args.get('activityId')
    reviews = mongo.db.reviews.find({'activity_id': activity_id})  # Adjust based on your schema
    reviews_list = [{'text': r['text'], 'date': r['date'], 'rating': r['rating'], 'name': r['name'], '_id': str(r['_id'])} for r in reviews]
    return jsonify({'reviews': reviews_list})

@app.route('/api/delete_review', methods=['POST'])
def delete_review():
    data = request.get_json()
    review_id = data.get('review_id')

    if not review_id:
        return jsonify({'message': 'Review ID is required'}), 400

    # Validate ObjectId format
    if not ObjectId.is_valid(review_id):
        return jsonify({'message': 'Invalid Review ID format'}), 400

    try:
        result = reviews_collection.delete_one({'_id': ObjectId(review_id)})
        if result.deleted_count:
            return jsonify({'message': 'Review deleted successfully'}), 200
        else:
            return jsonify({'message': 'Review not found'}), 404
    except Exception as e:
        return jsonify({'message': 'An error occurred while deleting the review', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
